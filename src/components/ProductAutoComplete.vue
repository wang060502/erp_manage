<template>
  <div class="product-auto-wrap" ref="wrapRef">
    <el-row :gutter="8">
      <el-col :span="12">
        <el-input
          v-model.trim="title"
          placeholder="产品名称"
          clearable
          @input="handleInput"
          @focus="showPanel = true"
        />
      </el-col>
      <el-col :span="12">
        <el-input
          v-model.trim="sku"
          placeholder="SKU"
          clearable
          @input="handleInput"
          @focus="showPanel = true"
        />
      </el-col>
    </el-row>
    <div
      v-if="showPanel && results.length"
      class="product-panel"
      :style="{ width: panelWidth + 'px' }"
    >
      <div
        v-for="item in results"
        :key="item.product_id"
        class="product-option"
        @mousedown.prevent="selectProduct(item)"
      >
        <el-image v-if="item.product_image" :src="item.product_image" style="width:32px;height:32px;margin-right:8px;object-fit:cover;border-radius:4px;" />
        <div>
          <div style="font-weight:bold;">{{ item.product_title }}</div>
          <div style="font-size:12px;color:#888;">SKU: {{ item.product_sku }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { getProductList } from '@/api/product/list'

interface ProductSearchResult {
  product_id: number;
  product_title: string;
  product_sku: string;
  product_image?: string;
}

const emit = defineEmits(['update:modelValue', 'select'])

const title = ref('')
const sku = ref('')
const results = ref<ProductSearchResult[]>([])
const showPanel = ref(false)
const panelWidth = ref(400)
const wrapRef = ref<HTMLElement | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const handleInput = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    if (!title.value && !sku.value) {
      results.value = []
      return
    }
    const res = await getProductList({
      product_title: title.value || undefined,
      product_sku: sku.value || undefined,
      page: 1,
      page_size: 20,
    })
    results.value = res.data?.list || []
    showPanel.value = true
    await nextTick()
    if (wrapRef.value) {
      panelWidth.value = wrapRef.value.offsetWidth
    }
  }, 300)
}

const selectProduct = (item: ProductSearchResult) => {
  emit('update:modelValue', item)
  emit('select', item)
  title.value = ''
  sku.value = ''
  results.value = []
  showPanel.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  if (!wrapRef.value?.contains(e.target as Node)) {
    showPanel.value = false
  }
}
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.product-auto-wrap {
  position: relative;
  width: 100%;
}
.product-panel {
  position: absolute;
  z-index: 99;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  box-shadow: 0 2px 12px #0001;
  margin-top: 2px;
  max-height: 320px;
  overflow-y: auto;
  left: 0;
}
.product-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
}
.product-option:hover {
  background: #f5f7fa;
}
</style>
