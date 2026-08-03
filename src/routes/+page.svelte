<script lang="ts">
    import Graph from '$lib/graph.svelte';
    import type { GraphLine } from '$lib/types';

    // Test data
    let graphWidth = 1000;
    let graphHeight = 300;

    let totalDays = 45;
    let startDate = new Date(2024, 0, 1);
    let xAxisDates: Date[] = Array.from({ length: totalDays }, (_, index) => {
        let date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        return date;
    });

    let line1: GraphLine = {
        name: 'Generator 1',
        color: 'red',
        points: xAxisDates.map((date, index) => ({
            x: date,
            y: 18 + Math.round(8 * Math.sin(index / 4) + (index % 6))
        }))
    };
    let line2: GraphLine = {
        name: 'Generator 2',
        color: 'green',
        points: xAxisDates.map((date, index) => ({
            x: date,
            y: 12 + Math.round(6 * Math.cos(index / 5) + (index % 4))
        }))
    };
    let line3: GraphLine = {
        name: 'Inverter 1',
        color: 'blue',
        points: xAxisDates.map((date, index) => ({
            x: date,
            y: 6 + Math.round(10 * Math.sin(index / 7) + (index % 9))
        }))
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
