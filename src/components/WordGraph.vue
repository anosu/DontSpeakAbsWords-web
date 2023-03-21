<template>
    <form action="">
        <el-input class="graph-input" v-model="val" placeholder="请输入内容"></el-input>
        <el-button class="graph-btn" size="large" @click="generateGraph()" type="success">查询</el-button>
    </form>
    <div id="graph"></div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

const val = ref('')
const graphData = reactive({
    nodes: [],
    edges: []
})

function generateGraph() {
    $("#graph").empty();
    if (val.value == '' || val.value.match(/\s+/)) {
        ElMessage.warning('内容为空')
        return
    }
    $.ajax({
        url: '/api/generateGraph',
        type: 'POST',
        dataType: 'JSON',
        data: {
            val: val.value
        },
        success: (resp) => {
            console.log(resp)
            if (resp.data.code === 0) {
                ElMessage.error('查询图谱失败>A<')
            } else {
                if (resp.data[0].length) {
                    ElMessage.success('查询成功，正在生成图谱>w<')
                    graphData.nodes = resp.data[0]
                    graphData.edges = resp.data[1]
                } else {
                    ElMessage.warning('没有查询到相关内容')
                }
            }
        },
        error: () => {
            ElMessage.error('发生未知错误;w;')
        },
        complete: () => {
            if (graphData.nodes.length) {
                graphData.nodes.forEach((node) => {
                    if (!node.style) {
                        node.style = {}
                    }
                    switch (node.class) {
                        case 'word': {
                            node.size = 50
                            node.style.fill = '#f0f8ff'
                            break
                        }
                        case 'translation': {
                            node.size = 55
                            node.style.fill = 'lightblue'
                            break
                        }
                        case 'source': {
                            node.size = 80
                            node.style.fill = '#FFB7C5'
                            break
                        }
                    }
                })
                let width = document.getElementById('graph').offsetWidth
                let graph = new G6.Graph({
                    fitView: true,
                    fitViewPadding: [20, 40, 50, 20],
                    container: 'graph',
                    width: width,
                    height: width,
                    defaultNode: {
                        size: 50,
                    },
                    defaultEdge: {
                        type: "line",
                        style: {
                            endArrow: true,
                            stroke: '#ffb8c6',
                            lineWidth: 1.5,
                            strokeOpacity: 10
                        }
                    },
                    layout: {
                        type: 'force2',
                        animate: false,
                        center: [0, 0],
                        linkDistance: 120,
                        nodeStrength: node => {
                            if (node.class === 'word') {
                                return 600
                            } else {
                                return 1000
                            }
                        },
                        preventOverlap: true,
                        nodeSize: 60
                    },
                    modes: {
                        default: ['drag-canvas', 'zoom-canvas', 'drag-node',
                            {
                                type: 'activate-relations',
                                trigger: 'click'
                            }
                        ], // 允许拖拽画布、放缩画布、拖拽节点...
                    },
                })
                graph.on('afteractivaterelations', (e) => {
                    console.log(e.item);
                    console.log(e.action);
                });
                graph.data(graphData)
                graph.render()
            }
        }
    })
}

onMounted(() => {
    $("#graph").empty();
})
</script>

<style scoped>
.graph-input {
    margin: 10px 0;
}

.graph-btn {
    margin: 10px 0;
}

#graph {
    width: 100%;
}
</style>