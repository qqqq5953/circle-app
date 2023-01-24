import { ref } from 'vue'

export default function useSort() {
  const sortMenu = ref({
    Ticker: {
      category: 'tempTicker',
      icon: 'fa-solid fa-hashtag'
    },
    Price: {
      category: 'price',
      icon: 'fa-solid fa-dollar-sign'
    },
    'Price change': {
      category: 'previousCloseChange',
      icon: 'fa-solid fa-chart-simple'
    },
    'Price change (%)': {
      category: 'previousCloseChangePercent',
      icon: 'fa-solid fa-chart-line'
    }
  })

  const sortDirection = ref({
    'Ascending (1-9)': {
      direction: 'ascending',
      icon: 'fa-solid fa-arrow-up-9-1'
    },
    'Descending (9-1)': {
      direction: 'descending',
      icon: 'fa-solid fa-arrow-down-9-1'
    }
  })

  const selectedDisplayName = ref('Price change (%)')
  const selectedSortCategory = ref('previousCloseChangePercent')
  const selectedDirection = ref('descending')

  const isSortMenuOpen = ref(false)
  const toggleSortMenu = ($event, isOpen) => {
    // deplay toggling after event
    if ($event.type === 'click') {
      isSortMenuOpen.value = !isSortMenuOpen.value
    }

    if ($event.type === 'blur') {
      setTimeout(() => {
        isSortMenuOpen.value = isOpen
      }, 150)
    }
  }

  const onClickSort = ({
    key = selectedDisplayName.value,
    category = selectedSortCategory.value,
    direction = selectedDirection.value
  }) => {
    selectedDisplayName.value = key
    selectedSortCategory.value = category
    selectedDirection.value = direction

    // emit('sortList', { category, direction })
    latestSortRules.value = { category, direction }
  }

  const latestSortRules = ref({
    category: 'previousCloseChangePercent',
    direction: 'descending'
  })

  const sortList = (sortRules, watchlist) => {
    const orderedList = [...watchlist].sort((a, b) =>
      showSortResult(sortRules, { a, b })
    )
    return orderedList
  }

  const showSortResult = (sortRules, { a, b }) => {
    const { category, direction } = sortRules

    latestSortRules.value.category = category
    latestSortRules.value.direction = direction

    const rulesMap = {
      tempTicker_descending: () => {
        if (a[category] > b[category]) return -1
        if (a[category] < b[category]) return 1
        return 0
      },
      tempTicker_ascending: () => {
        if (a[category] < b[category]) return -1
        if (a[category] > b[category]) return 1
        return 0
      },
      price_descending: b[category] - a[category],
      price_ascending: a[category] - b[category],
      previousCloseChange_descending: b[category] - a[category],
      previousCloseChange_ascending: a[category] - b[category],
      previousCloseChangePercent_descending: b[category] - a[category],
      previousCloseChangePercent_ascending: a[category] - b[category]
    }

    const rule = `${category}_${direction}`
    const sortResult = rulesMap[rule]

    switch (typeof sortResult) {
      case 'number': {
        return sortResult
      }
      case 'function': {
        return sortResult()
      }
      default:
        return 0
    }
  }

  return {
    sortMenu,
    sortDirection,
    selectedDisplayName,
    selectedSortCategory,
    selectedDirection,
    isSortMenuOpen,
    toggleSortMenu,
    onClickSort,
    latestSortRules,
    sortList
  }
}
