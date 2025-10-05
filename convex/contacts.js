import { mutation, query } from "./_generated/server"; 
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const getAllContacts = query({
  handler: async (ctx) => {
    // Ensure user is authenticated before proceeding
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    // Get expenses paid by current user (no group)
    const expensesYouPaid = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_group", (q) =>
        q.eq("paidByUserId", currentUser._id).eq("groupId", undefined)
      )
      .collect();

    // Get expenses in which current user is involved but did NOT pay
    const expensesNotPaidByYou = (
      await ctx.db
        .query("expenses")
        .withIndex("by_group", (q) => q.eq("groupId", undefined))
        .collect()
    ).filter(
      (e) =>
        e.paidByUserId !== currentUser._id &&
        e.splits.some((s) => s.userId === currentUser._id)
    );

    // Combine all relevant personal expenses
    const personalExpenses = [...expensesYouPaid, ...expensesNotPaidByYou];

    // Collect contact user IDs from expenses (excluding current user)
    const contactIds = new Set();
    personalExpenses.forEach((expense) => {
      if (expense.paidByUserId !== currentUser._id) {
        contactIds.add(expense.paidByUserId);
      }
      expense.splits.forEach((split) => {
        if (split.userId !== currentUser._id) {
          contactIds.add(split.userId);
        }
      });
    });

    // Fetch user details for contacts
    const contactUsers = (
      await Promise.all(
        [...contactIds].map(async (id) => {
          const user = await ctx.db.get(id);
          if (!user) return null;
          return {
            id: user._id,
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
            type: "user",
          };
        })
      )
    ).filter(Boolean);

    // Fetch groups where current user is a member
    const userGroups = (
      await ctx.db.query("groups").collect()
    )
      .filter((group) =>
        group.members.some((member) => member.userId === currentUser._id)
      )
      .map((group) => ({
        id: group._id,
        name: group.name,
        description: group.description || "",
        memberCount: group.members.length,
        type: "group",
      }));

    // Sort contacts and groups alphabetically by name
    contactUsers.sort((a, b) => a.name.localeCompare(b.name));
    userGroups.sort((a, b) => a.name.localeCompare(b.name));

    return {
      users: contactUsers,
      groups: userGroups,
    };
  },
});

export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    members: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Group name cannot be empty");
    }

    // Ensure current user is always a member/admin
    const uniqueMembers = new Set(args.members);
    uniqueMembers.add(currentUser._id);

    // Validate all user IDs exist
    for (const userId of uniqueMembers) {
      const userExists = await ctx.db.get(userId);
      if (!userExists) {
        throw new Error(`User with id ${userId} does not exist`);
      }
    }

    // Insert new group into DB
    return await ctx.db.insert("groups", {
      name: trimmedName,
      description: args.description ? args.description.trim() : "",
      createdByUserId: currentUser._id,
      members: [...uniqueMembers].map((userId) => ({
        userId,
        role: userId === currentUser._id ? "admin" : "member",
        joinedAt: Date.now(),
      })),
    });
  },
});