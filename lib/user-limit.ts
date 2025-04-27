"use server";
import { MAX_FREE_COUNTS, DAY_IN_MS } from "@/constants";
import prismadb from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs/server";

export const getUserLimit = async () => {
  try {
    const user = await currentUser();

    if (!user) return null;

    return await prismadb.userLimit.findUnique({
      where: {
        userId: user.id
      }
    });
  } catch (error) {
    console.error("Error in getUserLimit:", error);
    throw error;
  }
}

export const getUserLimitCount = async () => {
  try {
    const userLimit = await getUserLimit();

    if (!userLimit) return 0;

    return userLimit.count;
  } catch (error) {
    console.error("Error in getUserLimitCount:", error);
    return 0;
  }
}

export const checkUserLimit = async () => {
  try {
    const userLimit = await getUserLimit();

    if (!userLimit || userLimit.count < MAX_FREE_COUNTS) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error in checkUserLimit:", error);
    // If we can't check the limit, default to true to avoid blocking users
    return true;
  }
}

export const incrementUserLimit = async () => {
  try {
    const user = await currentUser();

    if (!user) return null;

    const userLimit = await getUserLimit();

    if (userLimit) {
      return await prismadb.userLimit.update({
        where: { userId: user.id },
        data: { count: userLimit.count + 1 },
      });
    }

    return await prismadb.userLimit.create({
      data: { userId: user.id, count: 1 },
    });
  } catch (error) {
    console.error("Error in incrementUserLimit:", error);
    throw error;
  }
}

export const checkSubscription = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return false;
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        stripeCustomerId: true,
        stripeCurrentPeriodEnd: true,
        stripePriceId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!userSubscription) return false;

    const isValid =
      userSubscription.stripePriceId &&
      userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now()

    return !!isValid;
  } catch (error) {
    console.error("Error in checkSubscription:", error);
    // Return false as a fallback when an error occurs
    return false;
  }
};
