<template>
  <main>
    <div id="carousel" class="flicking-viewport">
      <div id="flick" class="flicking-viewport">
        <div class="flicking-camera">
          <div style="width: 120px">1</div>
          <div style="width: 20%">2</div>
          <div style="width: 500px">3</div>
          <div style="width: 300px">4</div>
          <div style="width: 100%">5</div>
        </div>
      </div>
    </div>

    <section>
      <nav class="flex items-center border-b">
        <ul class="flex gap-x-1.5">
          <li
            class="border border-b-0 rounded-t"
            v-for="tab in top5Tabs"
            :key="tab.value"
          >
            <button
              class="px-2 py-1 text-sm"
              :class="
                selectedTab === tab.value ? 'text-indigo-600' : ' font-light'
              "
              @click="selectedTab = tab.value"
            >
              {{ tab.name }}
            </button>
          </li>
        </ul>
      </nav>
      <table class="w-full">
        <tbody>
          <tr
            class="border-b"
            v-for="item in selectedStocks"
            :key="item.ticker"
          >
            <td class="py-3">
              <div class="flex flex-col lg:flex-row lg:gap-x-3">
                <div
                  class="font-medium truncate max-w-[240px] sm:max-w-[360px] lg:max-w-none"
                >
                  {{ item.name }}
                </div>
                <div class="text-slate-500">{{ item.ticker }}</div>
              </div>
            </td>

            <td class="py-3 sm:px-2 lg:px-6">
              <div class="flex flex-col items-end">
                <div class="">${{ item.price }}</div>
                <div class="sm:hidden">
                  <span
                    class=""
                    :class="
                      item.previousCloseChangePercent > 0
                        ? 'text-red-600'
                        : item.previousCloseChangePercent < 0
                        ? 'text-green-700'
                        : 'text-slate-500'
                    "
                    >{{ item.previousCloseChangePercent }}%</span
                  >
                </div>
              </div>
            </td>

            <td class="hidden sm:table-cell sm:px-2 sm:py-3 lg:px-6">
              <div class="text-end font-medium">
                <span
                  class=""
                  :class="
                    item.previousCloseChangePercent > 0
                      ? 'text-red-600'
                      : item.previousCloseChangePercent < 0
                      ? 'text-green-700'
                      : 'text-slate-500'
                  "
                  >{{ item.previousCloseChangePercent }}%</span
                >
              </div>
            </td>

            <td class="hidden sm:table-cell sm:pl-2 sm:py-3 lg:pl-6">
              <div class="text-end font-light">
                <span
                  class=""
                  :class="
                    item.previousCloseChange > 0
                      ? 'text-red-600'
                      : item.previousCloseChange < 0
                      ? 'text-green-700'
                      : 'text-slate-500'
                  "
                  >{{ item.previousCloseChange }}</span
                >
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="space-y-4">
      <h2 class="text-center text-2xl font-semibold">Why Circle</h2>
      <ul class="flex flex-col gap-y-6">
        <li
          class="flex flex-col items-center gap-y-5 sm:flex-row sm:items-start sm:gap-x-8 shadow-indigo-100 py-4 text-center sm:text-left"
          v-for="text in whyCircle"
          :key="text"
        >
          <div
            class="w-16 h-16 rounded-full shadow-lg grid place-items-center shrink-0"
          >
            <i class="fa-solid" :class="text.icon"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium pb-3">{{ text.title }}</h3>
            <p class="text-slate-500">{{ text.content }}</p>
          </div>
        </li>
      </ul>
    </section>

    <section class="space-y-4">
      <h2 class="text-center text-2xl font-semibold">
        Create your portfolio today
      </h2>
      <ul class="flex flex-col gap-y-6">
        <li
          class="flex flex-col items-center gap-y-5 shadow-indigo-100 py-4 text-center sm:flex-row sm:items-start sm:gap-x-8 sm:text-left"
          v-for="text in createPortfolio"
          :key="text"
        >
          <div
            class="w-16 h-16 rounded-full shadow-lg grid place-items-center shrink-0"
          >
            <i class="fa-solid" :class="text.icon"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium pb-3">{{ text.title }}</h3>
            <p class="text-slate-500">{{ text.content }}</p>
          </div>
        </li>
      </ul>
    </section>

    <section class="space-y-4">
      <h2 class="text-center text-2xl font-semibold">
        How market feels about Circle?
      </h2>
      <ul class="flex flex-col gap-y-6 md:flex-row md:flex-wrap">
        <li
          class="shadow-indigo-100 py-4 text-center md:w-1/2 md:px-4 md:py-8"
          v-for="text in marketFeel"
          :key="text"
        >
          <div class="grid place-items-center">
            <img
              class="w-20 h-20 inline-block rounded-full"
              :src="text.picture"
              alt="profile-picture"
            />
          </div>
          <p class="text-xs text-slate-500 font-light pt-3 pb-5">
            {{ text.name }}, {{ text.job }}
          </p>
          <p class="text-slate-500">{{ text.content }}</p>
        </li>
      </ul>
    </section>

    <section class="space-y-4">
      <h2 class="text-center text-2xl font-semibold">
        Feedback from our users
      </h2>
      <ul class="flex gap-x-4">
        <li
          class="flex items-start flex-none gap-x-4 p-4 shadow-indigo-100 border rounded-xl w-[500px]"
          v-for="text in userFeedback.slice(0, 3)"
          :key="text"
        >
          <div class="shrink-0 grid place-items-center">
            <img
              class="w-20 h-20 inline-block rounded-full"
              :src="text.picture"
              alt="profile-picture"
            />
          </div>
          <div class="flex flex-col gap-y-2">
            <p class="text-lg font-medium">
              {{ text.name }}
            </p>
            <p class="text-slate-500">{{ text.content }}</p>
          </div>
        </li>
      </ul>

      <ul class="flex gap-x-4">
        <li
          class="flex items-start flex-none gap-x-4 p-4 shadow-indigo-100 border rounded-xl w-[500px]"
          v-for="text in userFeedback.slice(3, 6)"
          :key="text"
        >
          <div class="shrink-0 grid place-items-center">
            <img
              class="w-20 h-20 inline-block rounded-full"
              :src="text.picture"
              alt="profile-picture"
            />
          </div>
          <div class="flex flex-col gap-y-2">
            <p class="text-lg font-medium">
              {{ text.name }}
            </p>
            <p class="text-slate-500">{{ text.content }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- <flicking :plugins="plugins"> 123 </flicking> -->
  </main>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import http from "@/api";

export default {
  setup() {
    const whyCircle = ref([
      {
        title: "Easy to Use",
        content:
          "Circle provides a simple and intuitive interface, making it easy for users to manage their investments and track their portfolios.",
        icon: "fa-list-check text-3xl text-indigo-600",
      },
      {
        title: "Diversify Your Portfolio",
        content:
          "With Circle, users can create multiple watchlists and diversify their investments across different stocks and sectors.",
        icon: "fa-chart-pie text-4xl text-indigo-600",
      },
      {
        title: "Stay on Top of Market Trends",
        content:
          "Our platform provides real-time market data and analysis, helping users make informed investment decisions.",
        icon: "fa-arrow-trend-up text-3xl text-indigo-600",
      },
    ]);

    const createPortfolio = ref([
      {
        title: "Sign up",
        content:
          "Create an account on Circle by providing your basic information.",
        icon: "fa-user-plus text-2xl text-blue-700",
      },
      {
        title: "Build Your Watchlist",
        content:
          "Use our intuitive search function to add your preferred stocks to your watchlist.",
        icon: "fa-table-list text-3xl text-blue-700",
      },
      {
        title: "Manage Your Portfolio",
        content:
          "Keep track of your investments, monitor your performance, and adjust your portfolio as needed.",
        icon: "fa-hand-holding-dollar text-3xl text-blue-700",
      },
    ]);

    const marketFeel = ref([
      {
        picture: "https://randomuser.me/api/portraits/men/64.jpg",
        name: "Mariano Arias",
        job: "Investment Analyst",
        content:
          "“Circle is a game-changer in the investment management space. It’s easy to use and provides great insights into market trends.”",
      },
      {
        picture: "https://randomuser.me/api/portraits/men/13.jpg",
        name: "George Robin",
        job: "Portfolio Manager ",
        content:
          "“Circle has helped me diversify my portfolio and achieve my financial goals. I highly recommend it to anyone looking to invest.”",
      },
      {
        picture: "https://randomuser.me/api/portraits/women/23.jpg",
        name: "Marie Madsen",
        job: "Financial Advisor",
        content:
          "“Circle’s real-time market data and analysis is unmatched. It’s a must-have tool for any serious investor.”",
      },
      {
        picture: "https://randomuser.me/api/portraits/men/94.jpg",
        name: "Rich Murphy",
        job: "Investment Strategist",
        content:
          "“Circle is the perfect platform for beginners and experienced investors alike. It’s user-friendly and provides great value.”",
      },
    ]);

    const userFeedback = ref([
      {
        picture: "https://randomuser.me/api/portraits/men/61.jpg",
        name: "Oliver Grewal",
        content:
          "“Circle has been a game-changer for me. It’s easy to use and provides great insights into my investments.”",
      },
      {
        picture: "https://randomuser.me/api/portraits/women/65.jpg",
        name: "Shubha Vernekar",
        content:
          "“I’ve been using Circle for a few months now and I’m impressed with the platform. It’s helped me achieve my financial goals.”",
      },
      {
        picture: "https://randomuser.me/api/portraits/men/83.jpg",
        name: "Jeremy Sims",
        content:
          "“Circle has been a game-changer for me. It’s easy to use and provides great insights into my investments.”",
      },
      {
        picture: "https://randomuser.me/api/portraits/women/90.jpg",
        name: "Branka Weidlich",
        content:
          "“I’m new to investing and Circle has made it easy for me to get started. I highly recommend it to anyone looking to invest.”",
      },
      {
        picture: "https://randomuser.me/api/portraits/men/28.jpg",
        name: "Florian Bourgeois",
        content:
          "“Circle’s watchlist feature has helped me keep track of my favorite stocks and make informed investment decisions.”",
      },
      {
        picture: "https://randomuser.me/api/portraits/women/2.jpg",
        name: "Justine Singh",
        content:
          "“Circle’s portfolio management tools are top-notch. It’s made it easy for me to monitor my performance and adjust my investments as needed.”",
      },
    ]);

    // http
    //   .get("https://randomuser.me/api/?inc=picture,name&results=6")
    //   .then((res) => {
    //     console.log("randomuser", res.data.results);
    //     userFeedback.value.map((item, index) => {
    //       const { name, picture } = res.data.results[index];
    //       item.name = name.first + " " + name.last;
    //       item.picture = picture.large;
    //     });
    //   });

    const top5Tabs = ref([
      { name: "US stocks", value: "US" },
      { name: "TW stocks", value: "TW" },
    ]);

    const selectedTab = ref("US");
    const selectedStocks = computed(() => {
      return top5Caps.value[selectedTab.value];
    });

    const top5Caps = ref({
      US: [],
      TW: [],
    });

    async function getTop5Caps() {
      const us = ["AAPL", "MSFT", "AMZN", "TSLA", "NVDA"];
      const tw = ["2330.TW", "2317.TW", "2454.TW", "2308.TW", "2303.TW"];

      const usPromise = us.map((ticker) => {
        return http.get(`/api/quote/${ticker}`);
      });
      const usRes = await Promise.allSettled(usPromise);
      console.log("usRes", usRes);
      top5Caps.value.US = usRes.map((item) => {
        return item.value.data.result;
      });

      const twPromise = tw.map((ticker) => {
        return http.get(`/api/quote/${ticker}`);
      });
      const twRes = await Promise.allSettled(twPromise);
      console.log("twRes", twRes);
      top5Caps.value.TW = twRes.map((item) => {
        return item.value.data.result;
      });
    }

    // getTop5Caps();

    onMounted(() => {
      const flicking = new Flicking("#carousel", {
        align: "center",
        circular: true,
        renderOnlyVisible: true,
      });
    });

    return {
      whyCircle,
      createPortfolio,
      marketFeel,
      top5Tabs,
      selectedTab,
      selectedStocks,
      userFeedback,
    };
  },
};
</script>