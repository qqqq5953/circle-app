<template>
  <main class="text-slate-500">
    <h1 class="text-black font-semibold text-2xl md:text-4xl md:pb-4">
      Investment Management Made Easy with Circle
    </h1>
    <p class="font-semibold">
      Managing investments can be complex and time-consuming. That's where
      Circle comes in. We provide an
      <span class="text-indigo-700 italic"
        >intuitive investment management platform</span
      >
      that simplifies the process of managing your investments, so you can focus
      on achieving your financial goals.
    </p>

    <ul class="space-y-8">
      <li v-for="solution in solutions" :key="solution.title">
        <h2 class="text-black font-semibold text-lg md:text-2xl pb-2">
          {{ solution.title }}
        </h2>
        <p>{{ solution.content }}</p>
      </li>
    </ul>
  </main>
</template>

<script>
import { ref } from "vue";
export default {
  setup() {
    const solutions = ref([
      {
        title: "Watchlists",
        content:
          "Create watchlists to track your favorite stocks and stay up-to-date with market trends. This feature allows you to quickly access information about the companies you're interested in.",
      },
      {
        title: "Portfolio Management",
        content:
          "Easily manage your investment portfolio with our intuitive interface. View your account's profit or loss, total market value, and total cost. This feature provides a comprehensive view of your investment portfolio, helping you make better investment decisions.",
      },
      {
        title: "Real-time Market Information",
        content:
          "Stay up-to-date with the latest market trends with our real-time market information. This feature provides you with real-time updates on stock prices, news, and other important market information.",
      },
      {
        title: "Personalized Insights",
        content:
          "Our platform provides personalized insights and expert advice to help you make better investment decisions. This feature is based on your investment history, risk tolerance, and other factors, providing you with personalized recommendations to help you achieve your financial goals.",
      },
      {
        title: "Expert Support",
        content:
          "Our team of experts is available to help you with any questions you may have about our platform. We are committed to providing exceptional customer support, so you can get the most out of our platform.",
      },
    ]);

    return {
      solutions,
    };
  },
};
</script>