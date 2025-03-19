/**
 * Checks if user has enough karma to become a mentor and updates status if needed
 * @param {string} userId - MongoDB ID of the user
 */
export const checkAndUpdateMentorStatus = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    // If user has 500+ karma and is not already a mentor, make them a mentor
    if (user.karma >= 500 && !user.isMentor) {
      user.isMentor = true;
      await user.save();
      console.log(`User ${user.name} (${userId}) is now a student mentor with ${user.karma} karma points`);
    }
  } catch (error) {
    console.error("Error updating mentor status:", error);
  }
};