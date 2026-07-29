<script lang="ts">
    import Graph from '$lib/graph.svelte';
    import type { GraphPoint, GraphLine } from '$lib/types';

    // Test data
    let graphWidth = 1000;
    let graphHeight = 300;
    let xAxisDates: Date[] = [
        new Date(2024, 0, 1),
        new Date(2024, 0, 2),
        new Date(2024, 0, 3),
        new Date(2024, 0, 4),
        new Date(2024, 0, 5),
        new Date(2024, 0, 6),
    ];
    let line1: GraphLine = {
        name: 'Generator 1',
        color: 'red',
        points: [
            { x: new Date(2024, 0, 1), y: 10 },
            { x: new Date(2024, 0, 2), y: 20 },
            { x: new Date(2024, 0, 3), y: 5 },
            { x: new Date(2024, 0, 4), y: 25 },
            { x: new Date(2024, 0, 5), y: 30 },
            { x: new Date(2024, 0, 6), y: 10 },
        ]
    };
    let line2: GraphLine = {
        name: 'Generator 2',
        color: 'green',
        points: [
            { x: new Date(2024, 0, 1), y: 5 },
            { x: new Date(2024, 0, 2), y: 15 },
            { x: new Date(2024, 0, 3), y: 10 },
            { x: new Date(2024, 0, 4), y: 20 },
            { x: new Date(2024, 0, 5), y: 14 },
            { x: new Date(2024, 0, 6), y: 2 },
        ]
    };
    let line3: GraphLine = {
        name: 'Inverter 1',
        color: 'blue',
        points: [
            { x: new Date(2024, 0, 1), y: 2 },
            { x: new Date(2024, 0, 2), y: 5 },
            { x: new Date(2024, 0, 3), y: 8 },
            { x: new Date(2024, 0, 4), y: 12 },
            { x: new Date(2024, 0, 5), y: 18 },
            { x: new Date(2024, 0, 6), y: 50 },
        ]
    };
</script>

<style>
    .graph-container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 130px;
    }
</style>

<div class="graph-container">
    <Graph windowWidth={graphWidth} windowHeight={graphHeight} xAxisDates={xAxisDates} lines={[line1, line2, line3]}/>
</div>
