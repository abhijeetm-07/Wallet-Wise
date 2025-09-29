import { mutation } from "./_generated/server";


export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Must be authenticated to store a user
      throw new Error("Called storeUser without authentication present");
    }

    // Look up the user by their unique tokenIdentifier
    const user = await ctx.db
      .query("users")
      .withIndex("byTokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // If the user exists, check for name update and return
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      return user._id;
    }
    
    // Create a new user record
    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      imageUrl: identity.pictureUrl,
    });
  },
});