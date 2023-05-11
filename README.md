# Circle - Investment Management Platform

Circle is an investment management platform that allows users to manage their portfolio and track their investments.

# Project snapshot

<img src="/snapshot/overview.png" alt="Alt text" title="Optional title">

[Overview](/snapshot/overview.png)

[Holdings](/snapshot/holgins.png)

[Watchlist](/snapshot/watchlist.png)

[History](/snapshot/history.png)

[Company Description](/snapshot/info.png)

# Project link

[View project](https://cloud-func-test-256db.web.app/#/)
Please note that for demonstration purpose, there is a "Log in with 1 click" button that allows recruiters to view the dashboard without signing up!

# Features

Circle has the following pages:

**Before Log In**

1. Landing Page
2. About Page
3. Solutions Page

**After Log In**

1. **Overview** - An overview of the user's portfolio, including total value, performance, and asset allocation.
2. **Watchlist** - Add stocks to be tracked later.
3. **Company Description** - View detailed stock performance data for each company by clicking on the ticker symbol.
   a. Avaliable for Overview and Watchlist page
   b. Stock price is available for periods ranging from 5 days to 5 years.
   c. Financial data is also is available
4. **Holdings** - Displays the user's current holdings, including the quantity, value, and performance of each holding.
5. **History** - Shows the user's historical performance over time.

# Stack Used

Circle is built using the following technologies:

1. Vite
2. Vue 3
3. Tailwind
4. Apache Ecahrts
5. Express.js
6. Firebase: Functions, Realtime database, Hosting

# Known issues

For demonstration purpose, there are few limitation of the project:

1. Currently, using different account to log in will result in the same content. In the future, the database will be adjusted to let each user to store their own data.
2. In Holding page, the maximum number of stocks to be added is 5 stocks. Same rule applies to Watchlist page.
3. There are only US and TW data. In ther future, mutual fund data will be added.

# Getting Started

## Front end

```sh
npm i
npm run serve
npm run preview
npm run build
```

## Back end

```sh
cd server
npm i
node app.js
```
