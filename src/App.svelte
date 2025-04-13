<script lang="ts">
    import { onMount } from "svelte";
    import { Simulator } from "./lib/chu/simulator/simulator";
    import type { ChartNote } from "./lib/chu/chart";

    let canvas: HTMLCanvasElement | undefined;

    const initSimulator = async () => {
        let gl = canvas?.getContext("webgl2");
        if (!gl) return;
        let simulator = new Simulator({
            bpm: 170,
            offset: 0,
            data: [
                {
                    position: 1,
                    width: 6,
                    offset: 0,
                    subtype: 1,
                    type: "tap"
                },
                {
                    position: 1,
                    width: 6,
                    offset: 10,
                    type: "tap"
                },
                {
                    position: 2,
                    width: 8,
                    offset: 4,
                    type: "tap"
                },
                ...(() => {
                    let c: ChartNote[] = [];
                    for (var i = 0; 6 > i; i++) {
                        c.push({
                            position: (i / 1) + 6,
                            width: 8,
                            offset: 4,
                            type: "tap",
                            
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