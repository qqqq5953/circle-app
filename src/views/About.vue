<template>
  <main class="text-slate-500">
    <h1 class="text-black font-semibold text-2xl md:text-4xl md:pb-4">
      About Circle
    </h1>
    <p>
      Circle is an investment management platform that simplifies the process of
      managing investments. Our mission is to help people make smarter
      investment decisions and achieve their financial goals.
    </p>
    <div
      class="flex justify-start even:justify-end"
      v-for="(item, index) in about"
      :key="index"
    >
      <p
        class="lg:shadow-md lg:rounded-lg lg:px-6 lg:py-3 lg:w-2/3 lg:h-32 lg:grid lg:place-items-center"
      >
        {{ item }}
      </p>
    </div>
    <div
      class="font-semibold text-lg text-center text-indigo-600 md:text-3xl md:pt-8 italic"
    >
      Sign up today and start managing your investments with confidence.
    </div>
  </main>
</template>

<script>
import { ref } from "vue";
export default {
  setup() {
    const about = ref([
      "At Circle, we understand that managing investments can be complex and time-consuming. That's why we've created an intuitive platform that provides users with the tools and information need to make informed investment decisions.",
      "Our platform offers a range of features to help users manage their investments with ease. From creating watchlists to managing portfolios, our platform provides a seamless experience that makes it easy to stay on top of your investments.",
      "In addition, Circle provides real-time market information and personalized insights to help users make better investment decisions. Our team of experts is dedicated to helping users achieve their investment goals and is available to provide support whenever needed.",
      "At Circle, we believe that everyone should have access to high-quality investment management tools and expertise. That's why we've made our platform affordable and accessible to all.",
    ]);

    return {
      about,
    };
  },
};
</script>