<template>
  <canvas style="width: 100vw; height: 100vh;" id="canvas"></canvas>
</template>

<script lang="ts">
import { hello } from "../src/index";
import "@alipay/o3";

export default {
  name: "App",
  components: {},
  mounted() {
		hello();
	}
};
</script>
