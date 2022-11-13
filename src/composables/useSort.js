import { ref } from 'vue'

export default function useSort(emit) {
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

  const sortList = ({
    key = selectedDisplayName.value,
    category = selectedSortCategory.value,
    direction = selectedDirection.value
  }) => {
    selectedDisplayName.value = key
    selectedSortCategory.value = category
    selectedDirection.value = direction

    emit('sortList', { category, direction })
  }

  const isSortMenuOpen = ref(false)
  const toggleSortMenu = () => (isSortMenuOpen.value = !isSortMenuOpen.value)

  return {
    sortMenu,
    sortDirection,
    selectedDisplayName,
    selectedSortCategory,
    selectedDirection,
    isSortMenuOpen,
    toggleSortMenu,
    sortList
  }
}
