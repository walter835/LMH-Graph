<script lang="ts">
    import { line, area, curveMonotoneX } from 'd3-shape';
    import type { GraphPoint, GraphLine } from '$lib/types';

    interface GraphParams {
        windowWidth: number;
        windowHeight: number;
        xAxisDates: Date[];
        lines: GraphLine[];
    }
    let { windowWidth, windowHeight, xAxisDates, lines }: GraphParams = $props();

    function verifyLines() {
        for (let graphLine of lines) {
            let timeSet = new Set<number>(graphLine.points.map(point => point.x.getTime()));
            for (let date of xAxisDates) {
                if (!timeSet.has(date.getTime())) {
                    throw new Error(`Graph line with color ${graphLine.color} is missing a point for date ${date.toISOString()}`);
                }
            }
        }
    }
    verifyLines();

    function trimLines() {
        let minTime = xAxisDates[0].getTime();
        let maxTime = xAxisDates[xAxisDates.length - 1].getTime();
        
        for (let graphLine of lines) {
            graphLine.points = graphLine.points.filter(
                point => point.x.getTime() <= maxTime && point.x.getTime() >= minTime
            );
        }
    }
    trimLines();

    interface ScaledGraphPoint {
        x: number;
        y: number;
        originalDate: Date;
        originalValue: number;
    }
    
    let maxY = $derived(Math.max(...lines.map(line => Math.max(...line.points.map(point => point.y)))));
    let minX = $derived(xAxisDates[0].getTime());
    let maxX = $derived(xAxisDates[xAxisDates.length - 1].getTime());
    
    let xAxisBuffer = 20;
    let yAxisBuffer = 40;

    let innerWidth = $derived(windowWidth - yAxisBuffer);
    let innerHeight = $derived(windowHeight - xAxisBuffer);
    
    function scaleGraphPoints(points: GraphPoint[]): ScaledGraphPoint[] {
        return points.map(point => ({
            x: ((point.x.getTime() - minX) / (maxX - minX)) * innerWidth,
            y: innerHeight - ((point.y / maxY) * innerHeight / 1.05),
            originalDate: point.x,
            originalValue: point.y
        }));
    }
    
    let lineGenerator = $derived(line<ScaledGraphPoint>()
        .x(d => d.x)
        .y(d => d.y)
        .curve(curveMonotoneX)
    );
    let areaGenerator = $derived(area<ScaledGraphPoint>()
        .x(d => d.x)
        .y1(d => d.y) 
        .y0(innerHeight)
        .curve(curveMonotoneX)
    );

    let dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    let selectedLineIndex: number = $state(0);
    let hoveredData = $state<{ point: ScaledGraphPoint, graphLine: GraphLine } | null>(null);

    function getLineColorImpl(index: number, opacity: number): string {
        let baseColor = lines[index].color;
        return `color-mix(in srgb, ${baseColor} ${opacity}%, transparent)`;
    }
    function getLineColor(index: number): string {
        let selectedOpacity = 100;
        let unselectedOpacity = 30;
        let opacity = index === selectedLineIndex ? selectedOpacity : unselectedOpacity;
        return getLineColorImpl(index, opacity);
    }
    function getAreaFillColor(index: number): string {
        let selectedOpacity = 20;
        let unselectedOpacity = 5;
        let opacity = index === selectedLineIndex ? selectedOpacity : unselectedOpacity;
        return getLineColorImpl(index, opacity);
    }

    function selectLine(index: number) {
        selectedLineIndex = index;
    }
</script>

<style>
    .stack {
        display: flex;
        flex-direction: column;
        align-items: center;
        /* 3. Added relative positioning so the absolute tooltip stays inside the graph area */
        position: relative; 
    }
    .line-button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
    }
</style>

<div class="stack">
    <svg width={windowWidth + xAxisBuffer} height={windowHeight + yAxisBuffer}>
        <!-- draw lines -->
        <svg x={yAxisBuffer} y={0} width={windowWidth - yAxisBuffer} height={windowHeight - xAxisBuffer}>
            <rect x="0" y="0" width={windowWidth - xAxisBuffer} height={windowHeight - xAxisBuffer} fill="none" stroke="black" stroke-width="2" />
        
            {#each lines as graphLine, index}
                {@const scaledPoints = scaleGraphPoints(graphLine.points)}
                
                <path
                    d={areaGenerator(scaledPoints)}
                    fill={getAreaFillColor(index)}
                    stroke="none"
                />

                {@const lineColor = getLineColor(index)}
                <path
                    d={lineGenerator(scaledPoints)}
                    fill="none"
                    stroke={lineColor}
                    stroke-width="2"
                />
                
                {#each scaledPoints as point}
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <circle
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="transparent" 
                        stroke={lineColor}
                        stroke-width="2"
                        style="cursor: pointer;"
                        onmouseenter={() => hoveredData = { point, graphLine }}
                        onmouseleave={() => hoveredData = null}
                    />
                {/each}
            {/each}
            
            {#each {length: 5} as _, i}
                <line
                    x1={0}
                    y1={(windowHeight - xAxisBuffer) * ((i + 1) / 5)}
                    x2={windowWidth - yAxisBuffer}
                    y2={(windowHeight - xAxisBuffer) * ((i + 1) / 5)}
                    stroke="lightgray"
                    stroke-width="1"
                />
            {/each}
        </svg>
        
        <!-- draw x axis -->
        <svg x={0} y={windowHeight - xAxisBuffer} width={windowWidth + yAxisBuffer} height={xAxisBuffer}>
            {#each xAxisDates as date, i}
                <text
                    x={yAxisBuffer + (windowWidth - yAxisBuffer) * (i / (xAxisDates.length - 1))}
                    y={xAxisBuffer / 2}
                    text-anchor="middle"
                    alignment-baseline="middle"
                    font-size="12"
                >
                {date.toLocaleDateString('en-US', dateOptions)}
                </text>
            {/each}
        </svg>
        
        <!-- draw y axis -->
        <svg x={0} y={0} width={yAxisBuffer} height={windowHeight - xAxisBuffer}>
            {#each {length: 4} as _, i}
                <text
                    x={yAxisBuffer / 2}
                    y={(windowHeight - xAxisBuffer) * (1 - (i + 1) / 5)}
                    text-anchor="middle"
                    alignment-baseline="middle"
                    font-size="12"
                >
                {(maxY * ((i + 1) / 5)).toFixed(2)}
                </text>
            {/each}
        </svg>
    </svg>
    <!-- draw point window -->
    {#if hoveredData}
        <div style="
            position: absolute; 
            left: {hoveredData.point.x + yAxisBuffer + 10}px; 
            top: {hoveredData.point.y - 10}px; 
            background-color: white; 
            border: 1px solid {hoveredData.graphLine.color}; 
            padding: 8px;
            border-radius: 4px;
            pointer-events: none; 
            font-size: 14px;
        ">
            <strong style="color: {hoveredData.graphLine.color}">{hoveredData.graphLine.name}</strong><br>
            Date: {hoveredData.point.originalDate.toLocaleDateString('en-US', dateOptions)}<br>
            Value: {hoveredData.point.originalValue}
        </div>
    {/if}

    <div style="display: flex; gap: 20px; justify-content: center; margin-top: 10px;">
        {#each lines as graphLine, index}
            <div style="display: flex; align-items: center;">
                <button class="line-button" style="color: {getLineColor(index)}; font-weight: bold;" onclick={() => selectLine(index)}>{graphLine.name}</button>
            </div>
        {/each}
    </div>
</div>