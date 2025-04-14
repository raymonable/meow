<script lang="ts">
    import { onMount } from "svelte";
    import { Simulator } from "./lib/chu/simulator/simulator";
    import type { ChartNote } from "./lib/chu/chart";

    let canvas: HTMLCanvasElement | undefined;

    const initSimulator = async () => {
        let gl = canvas?.getContext("webgl2");
        if (!gl) return;
        let simulator = new Simulator({
            bpm: 110,
            offset: 0,
            data: [
                {
                    position: 0.5,
                    width: 4,
                    offset: 0,
                    subtype: 2,
                    type: "tap"
                },
                {
                    position: 0.5,
                    width: 4,
                    offset: 0,
                    type: "air"
                },
                {
                    position: 1,
                    width: 8,
                    offset: 4,
                    type: "tap"
                },
                ...(() => {
                    let c: ChartNote[] = [];
                    for (var i = 0; 60 > i; i++) {
                        c.push({
                            position: (i / 4) + 0.15,
                            width: 8,
                            offset: 4,
                            type: "tap",
                            subtype: 1
                        });
                    }
                    return c;
                })()
            ]
        }, gl);
        await simulator.init();
    };
    //onMount(initSimulator);
</script>
<canvas width="1920" height="1080" bind:this={canvas} on:click={initSimulator}></canvas>
<style>
    canvas {
        background: green;
        width: 100%;
    }
</style>