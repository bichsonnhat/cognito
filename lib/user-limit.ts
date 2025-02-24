import { MAX_FREE_COUNTS, DAY_IN_MS } from "@/constants";
import prismadb from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs/server";

export const getUserLimit = async () => {
  const user = await currentUser();

  if (!user) return null;

  return await prismadb.userLimit.findUnique({
    where: {
      userId: user.id
    }
  });
}

export const getUserLimitCount = async () => {
  const userLimit = await getUserLimit();

  if (!userLimit) return 0;

  return userLimit.count;
}

export const checkUserLimit = async () => {
  const userLimit = await getUserLimit();

  if (!userLimit || userLimit.count < MAX_FREE_COUNTS) {
    return true;
  }

  return false;
}

export const incrementUserLimit = async () => {
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
}

export const checkSubscription = async () => {
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
};
