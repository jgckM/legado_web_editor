<template>
  <div class="main">
    <edit-input
      v-for="(item, index) in data"
      :key="index"
      :type="item.id"
      :hint="item.hint"
      :title="item.title"
      :rows="item.rows"
      :content="setContent(item.id)"
      @changeContent="upData"
    ></edit-input>
  </div>
</template>

<script>
import editInput from "@/components/editInput";
import bookinfo from "@/utils/editConfig.js";
import { reactive, toRefs } from "vue";
import useCounter from "@/utils/useCounter";

export default {
  components: {
    editInput,
  },
  setup() {
    const { setContent, upData, bookContent } = useCounter();
    const data = reactive({
      data: bookinfo.content,
    });
    return {
      ...toRefs(data),
      upData,
      setContent,
      bookContent,
    };
  },
};
</script>

<style lang="scss"></style>
