'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { getCurrentSpaceId } from '@/lib/spaces'
import { events } from '@/lib/events'

interface Thought {
  id: string
  spaceId: string
  content: string
  createdAt: string
}

interface Node extends d3.SimulationNodeDatum {
  id: string
  content: string
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node
  target: string | Node
}

export function GraphView() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [spaceId, setSpaceId] = useState<string | null>(getCurrentSpaceId())
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  useEffect(() => {
    const unsub = events.on<{ id: string | null }>('space:selected', ({ id }) => {
      setSpaceId(id)
    })
    return () => unsub()
  }, [])

  // Load thoughts
  useEffect(() => {
    async function loadThoughts() {
      if (!spaceId) return
      try {
        const res = await fetch(`/api/thoughts?spaceId=${spaceId}`)
        if (res.ok) {
          const data = await res.json()
          setThoughts(data)
        }
      } catch (error) {
        console.error('Failed to load thoughts:', error)
      }
    }

    if (spaceId) {
      loadThoughts()
    } else {
      setThoughts([])
    }
  }, [spaceId])

  // Listen for new thoughts
  useEffect(() => {
    const unsub = events.on<{ thought: Thought }>('thought:created', ({ thought }) => {
      if (thought.spaceId === spaceId) {
        setThoughts(prev => [thought, ...prev])
      }
    })
    return () => unsub()
  }, [spaceId])

  // Render D3 graph
  useEffect(() => {
    if (!svgRef.current || thoughts.length === 0) return

    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    svg.selectAll('*').remove()

    // Create nodes from thoughts
    const nodes: Node[] = thoughts.map(t => ({
      id: t.id,
      content: t.content.slice(0, 50) + (t.content.length > 50 ? '...' : ''),
    }))

    // Create links between sequential thoughts (simple connection for now)
    const links: Link[] = []
    for (let i = 1; i < nodes.length; i++) {
      links.push({
        source: nodes[i - 1].id,
        target: nodes[i].id,
      })
    }

    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))

    // Create container with zoom
    const g = svg.append('g')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1)

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )

    node.append('circle')
      .attr('r', 20)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#1d4ed8')
      .attr('stroke-width', 2)

    node.append('text')
      .text(d => d.content.slice(0, 10))
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr('font-size', '10px')
      .attr('fill', 'currentColor')

    node.on('click', (event, d) => {
      setSelectedNode(d)
    })

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [thoughts])

  if (!spaceId) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Select a space to view graph
      </div>
    )
  }

  if (thoughts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        No thoughts yet. Create some in Chat to see them here.
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <svg
        ref={svgRef}
        className="flex-1 w-full bg-neutral-50 dark:bg-neutral-900"
      />
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg max-w-md">
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600"
          >
            ×
          </button>
          <p className="text-sm">{thoughts.find(t => t.id === selectedNode.id)?.content}</p>
        </div>
      )}
    </div>
  )
}
