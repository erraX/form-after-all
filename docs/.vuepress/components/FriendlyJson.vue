<template>
  <div class="friendly-json">
    <pre><span class="title">{{ title }}:</span>
{{ JSON.stringify(json, null, 2) }}</pre>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    json: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.friendly-json {
  .title {
    color: black;
    font-size: 16px;
    font-weight: bold;
  }
  pre {
    color: black;
    background-color: #f3f3f3;
  }
}
</style>
