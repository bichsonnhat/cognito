import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { absoluteUrl } from "@/lib/utils";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId: user.id
      }
    })

    const dashboardUrl = absoluteUrl("/dashboard");
    if (userSubscription?.stripeCustomerId) {
      const configuration = await stripe.billingPortal.configurations.create({
        business_profile: {
          headline: "Cognito Pro Subscription",
          privacy_policy_url: dashboardUrl,
          terms_of_service_url: dashboardUrl,
        },
        features: {
          invoice_history: {
            enabled: true,
          },
        },
      });
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: dashboardUrl,
      })

      return new NextResponse(JSON.stringify({ url: stripeSession.url }))
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: dashboardUrl,
      cancel_url: dashboardUrl,
      payment_method_types: ["card"],
      customer_email: user.emailAddresses[0].emailAddress,
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Cognito Pro",
              description: "Unlimited Generations"
            },
            unit_amount: 10000,
            recurring: {
              interval: "month"
            }
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
      },
    })

    return new NextResponse(JSON.stringify({ url: stripeSession.url }))
  } catch (error) {
    console.log(error);
    
    return new NextResponse("Sơmething went wrong.", { status: 500 });
  }
};
