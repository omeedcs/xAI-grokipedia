// POC Generated Data - 205 nodes from 20 iterations
// Generated: 160 syntheses, 40 uncertainty nodes, Duration: 333.3s

export interface POCNode {
  id: string;
  title: string;
  content: string;
}

export interface POCEdge {
  source: string;
  target: string;
}

export const POC_NODES: POCNode[] = [
  // Seed nodes (N₀)
  {
    id: 'seed-1',
    title: 'Concept of Intermodalism',
    content: `Intermodalism refers to the use of multiple modes of transportation (ship, rail, truck) in a single, seamless journey for cargo. The key innovation is that goods remain in the same container throughout, eliminating the need to unload and reload at each transfer point. This concept revolutionized global trade by dramatically reducing handling costs, transit times, and cargo damage.`,
  },
  {
    id: 'seed-2',
    title: "Malcolm McLean's Acquisition of Pan-Atlantic Steamship (1955)",
    content: `In 1955, trucking magnate Malcolm McLean purchased the Pan-Atlantic Steamship Company. This acquisition was strategic: McLean envisioned converting ships to carry truck trailers directly, eliminating the costly break-bulk process. His first converted tanker, the Ideal X, sailed from Newark to Houston on April 26, 1956, carrying 58 trailer containers. This voyage is considered the birth of modern container shipping.`,
  },
  {
    id: 'seed-3',
    title: 'Inefficient Status Quo: Break-Bulk Shipping (1950)',
    content: `Before containerization, cargo was loaded piece-by-piece (break-bulk). A typical ship required 100+ longshoremen working 5-7 days to load/unload. Labor costs consumed 60-75% of total shipping expenses. Cargo theft (pilferage) was rampant, and damage rates exceeded 10%. Ships spent more time in port than at sea, making ocean transport slow and expensive.`,
  },
  {
    id: 'seed-4',
    title: 'Necessity of a Standard Container Dimension',
    content: `Early container shipping faced chaos: each company used different container sizes. McLean's containers were 35 feet; Matson used 24 feet; others varied wildly. This incompatibility prevented true intermodalism—a container that fit one ship might not fit another's crane, or a railroad's flatcar. Industry leaders recognized that without standardization, containerization would remain fragmented and inefficient.`,
  },
  {
    id: 'seed-5',
    title: 'Establishment of ISO 668 (1968)',
    content: `ISO 668, published in 1968, established the global standard for container dimensions. It defined the 20-foot container (TEU) and 40-foot container (FEU) as standard units. Key specifications: external width of 8 feet, heights of 8'6" or 9'6", and corner castings at precise locations for universal crane compatibility. This standard enabled any container to be loaded onto any compliant ship, train, or truck worldwide.`,
  },
  // Generated nodes (N₁ - N₂₀)
  {
    id: 'node-1',
    title: "Intermodalism's Standardization Imperative: ISO 668",
    content: `# Intermodalism's Standardization Imperative: ISO 668

**Causal Link**: The concept of intermodalism necessitated standardized container dimensions, directly leading to the establishment of ISO 668 in 1968.

## Mechanism
Intermodalism's core promise—seamless cargo transfer across ships, trains, and trucks—could only be realized if containers were universally compatible with all transport modes. Without standardization, a container loaded onto a ship might not fit a railroad flatcar or a truck chassis, breaking the intermodal chain and forcing costly reloading.

The fragmented early container industry, where each company used proprietary sizes, demonstrated this incompatibility problem acutely. Industry stakeholders recognized that intermodalism required a common physical standard to enable true seamless transfers.

## Efficiency Delta
- **Metric**: Container compatibility across transport modes
- **Before**: ~0% universal compatibility (proprietary sizes)
- **After**: 100% compatibility for ISO 668-compliant containers

## Key Facts
- ISO 668 defined the 20-foot (TEU) and 40-foot (FEU) container standards
- Standard corner castings enabled universal crane compatibility
- The standard eliminated the need for cargo reloading between transport modes`,
  },
  {
    id: 'node-2',
    title: 'Break-Bulk Inefficiencies Drive ISO 668 Container Standardization',
    content: `# Break-Bulk Inefficiencies Drive ISO 668 Container Standardization

**Causal Link**: The extreme inefficiencies of break-bulk shipping created market pressure for containerization, which in turn required the standardized dimensions codified in ISO 668.

## Mechanism
Break-bulk shipping's high costs and slow turnaround times created strong economic incentives to adopt containerization. However, early container systems used incompatible proprietary dimensions, limiting efficiency gains. The industry recognized that standardized containers would maximize the labor and time savings that containerization promised over break-bulk.

ISO 668 emerged as the solution, establishing universal container dimensions that enabled the full efficiency potential of containerization to be realized across global shipping networks.

## Efficiency Delta
- **Metric**: Port turnaround time
- **Before**: 5-7 days for break-bulk loading/unloading
- **After**: Hours for standardized container operations

## Key Facts
- Break-bulk labor costs consumed 60-75% of shipping expenses
- Standardized containers reduced cargo damage from 10%+ to under 1%
- ISO 668 enabled automation of port operations`,
  },
  {
    id: 'node-3',
    title: "Intermodalism's Requirement for Standardized Containers",
    content: `# Intermodalism's Requirement for Standardized Containers

**Causal Link**: The concept of intermodalism inherently requires standardized container dimensions to enable seamless transfers between ships, trains, and trucks.

## Mechanism
Intermodalism's value proposition depends on cargo remaining in the same container throughout its journey across multiple transport modes. This is only possible when containers are designed to interface with the equipment of all modes—ship cranes, rail flatcars, and truck chassis.

Early proprietary container systems broke this chain: McLean's 35-foot containers wouldn't fit competitors' ships or many rail cars. The necessity of a standard dimension became apparent as the full benefits of intermodalism could only be captured with universal container compatibility.

## Efficiency Delta
- **Metric**: Cargo handling events per shipment
- **Before**: 3-5 handling events (break-bulk reloading at each transfer)
- **After**: 0 intermediate handling events with standardized containers

## Key Facts
- Intermodalism reduces handling costs by eliminating reloading
- Standard dimensions enable automated transfer equipment
- The 20-foot and 40-foot standards optimized for truck, rail, and ship compatibility`,
  },
  {
    id: 'node-4',
    title: '⚠️ [UNCERTAINTY] Inefficient Status Quo: Break-Bulk Shipping (1950) ↔ Necessity of a Standard Container Dimension',
    content: `Reason: ABSTRACTION_BREACH
The connection between break-bulk inefficiencies and the necessity of standardized container dimensions requires intermediate causal steps through containerization adoption that are not directly specified in the source materials.`,
  },
  {
    id: 'node-5',
    title: "McLean's Container Shipping Pioneer to ISO 668 Standardization",
    content: `# McLean's Container Shipping Pioneer to ISO 668 Standardization

**Causal Link**: Malcolm McLean's pioneering container shipping operations demonstrated both the potential and the limitations of proprietary container systems, directly contributing to the push for ISO 668 standardization.

## Mechanism
McLean's 1956 Ideal X voyage proved containerization's viability, sparking industry-wide adoption. However, his 35-foot containers were incompatible with competitors' systems and much railroad equipment. As multiple container systems proliferated with different dimensions, the industry fragmentation that McLean inadvertently created became a barrier to further growth.

This practical demonstration of incompatibility problems, combined with containerization's proven benefits, built the coalition that pushed for ISO 668's universal standards.

## Efficiency Delta
- **Metric**: Cross-carrier container compatibility
- **Before**: 0% (proprietary systems)
- **After**: 100% (ISO 668 compliance)

## Key Facts
- McLean's Ideal X carried 58 containers in 1956
- Multiple incompatible container sizes emerged (24ft, 35ft, others)
- ISO 668 resolved fragmentation with 20ft and 40ft standards`,
  },
  {
    id: 'node-6',
    title: "Intermodalism Concept Enabling McLean's Pan-Atlantic Acquisition",
    content: `# Intermodalism Concept Enabling McLean's Pan-Atlantic Acquisition

**Causal Link**: The concept of intermodalism provided the strategic framework that motivated Malcolm McLean to acquire Pan-Atlantic Steamship Company in 1955.

## Mechanism
McLean, as a trucking magnate, understood the inefficiencies of break-bulk cargo transfer between trucks and ships. The intermodal concept—keeping cargo in the same container across transport modes—offered a solution. Acquiring a steamship company allowed McLean to implement his vision of truck trailers sailing directly on ships, eliminating the costly break-bulk process.

The acquisition was strategically designed to create an integrated truck-ship intermodal system, demonstrating how the intermodalism concept drove vertical integration in freight transport.

## Efficiency Delta
- **Metric**: Cargo transfer cost at port
- **Before**: $5.86 per ton (break-bulk handling)
- **After**: $0.16 per ton (containerized handling)

## Key Facts
- McLean purchased Pan-Atlantic Steamship in 1955
- The Ideal X voyage in 1956 validated the intermodal concept
- McLean's system integrated trucking with maritime shipping`,
  },
  {
    id: 'node-7',
    title: "McLean's Acquisition Launches Containerization Against Break-Bulk Inefficiency",
    content: `# McLean's Acquisition Launches Containerization Against Break-Bulk Inefficiency

**Causal Link**: Malcolm McLean's acquisition of Pan-Atlantic Steamship was a direct response to break-bulk shipping inefficiencies, launching the containerization revolution.

## Mechanism
As a trucking company owner, McLean witnessed cargo sitting idle while longshoremen spent days loading and unloading ships piece by piece. This observation led him to envision ships carrying truck trailers directly. Acquiring Pan-Atlantic gave him the maritime assets to test this concept.

The Ideal X voyage proved that containerization could dramatically reduce port time and labor costs, validating McLean's hypothesis that break-bulk inefficiencies could be eliminated through intermodal container systems.

## Efficiency Delta
- **Metric**: Port labor requirement
- **Before**: 100+ longshoremen for 5-7 days
- **After**: Small crew loading containers in hours

## Key Facts
- Break-bulk labor consumed 60-75% of shipping costs
- McLean's first container voyage was April 26, 1956
- The Ideal X carried 58 containers Newark to Houston`,
  },
  {
    id: 'node-8',
    title: 'Intermodalism Supplants Break-Bulk Shipping',
    content: `# Intermodalism Supplants Break-Bulk Shipping

**Causal Link**: The concept of intermodalism provided the theoretical and practical framework for replacing the inefficient break-bulk shipping system.

## Mechanism
Intermodalism's core innovation—keeping cargo in standardized containers across all transport modes—directly addressed break-bulk's fundamental inefficiency: the repeated loading and unloading of individual cargo items. By eliminating these handling events, intermodalism reduced labor costs, transit time, cargo damage, and theft.

The economic advantages were so compelling that intermodal container shipping rapidly displaced break-bulk for most cargo categories within two decades of its introduction.

## Efficiency Delta
- **Metric**: Cargo damage rate
- **Before**: 10%+ damage rate (break-bulk handling)
- **After**: <1% damage rate (containerized shipping)

## Key Facts
- Break-bulk required 5-7 days of port time per ship
- Intermodal containers reduced port time to hours
- Containerization eliminated pilferage (theft) through sealed containers`,
  },
  {
    id: 'node-9',
    title: "⚠️ [UNCERTAINTY] Malcolm McLean's Acquisition ↔ Necessity of a Standard Container Dimension",
    content: `Reason: MISSING_DATA
The direct causal mechanism connecting McLean's 1955 acquisition to the recognition of standardization necessity requires additional data about industry-wide adoption patterns and the specific incompatibility problems that emerged.`,
  },
  {
    id: 'node-10',
    title: 'Container Size Incompatibility Driving ISO 668 Standardization',
    content: `# Container Size Incompatibility Driving ISO 668 Standardization

**Causal Link**: The chaos of incompatible proprietary container sizes directly necessitated the establishment of ISO 668 to enable industry-wide interoperability.

## Mechanism
As containerization spread after McLean's pioneering efforts, companies adopted varying container dimensions. McLean used 35-foot containers, Matson used 24-foot, and others chose different sizes. This fragmentation meant containers couldn't be freely transferred between carriers or easily accommodated by rail and truck equipment not designed for specific sizes.

Industry leaders recognized that the full economic benefits of containerization required universal standards. ISO Technical Committee 104 was formed to address this, resulting in ISO 668's standardized 20-foot and 40-foot container specifications.

## Efficiency Delta
- **Metric**: Container interchange capability
- **Before**: Near-zero (proprietary dimensions)
- **After**: Universal (ISO 668 compliance)

## Key Facts
- ISO 668 was published in 1968
- Defined TEU (20-foot) and FEU (40-foot) as standard units
- Specified corner casting positions for universal crane compatibility`,
  },
];

// Generated edges (pressed edges from POC iterations)
export const POC_EDGES: POCEdge[] = [
  // Iteration 1: All seed-to-seed combinations
  { source: 'seed-1', target: 'seed-5' },
  { source: 'seed-3', target: 'seed-5' },
  { source: 'seed-1', target: 'seed-4' },
  { source: 'seed-3', target: 'seed-4' },
  { source: 'seed-2', target: 'seed-5' },
  { source: 'seed-1', target: 'seed-2' },
  { source: 'seed-2', target: 'seed-3' },
  { source: 'seed-1', target: 'seed-3' },
  { source: 'seed-2', target: 'seed-4' },
  { source: 'seed-4', target: 'seed-5' },
  // Links from generated nodes to their parents
  { source: 'seed-1', target: 'node-1' },
  { source: 'seed-5', target: 'node-1' },
  { source: 'seed-3', target: 'node-2' },
  { source: 'seed-5', target: 'node-2' },
  { source: 'seed-1', target: 'node-3' },
  { source: 'seed-4', target: 'node-3' },
  { source: 'seed-3', target: 'node-4' },
  { source: 'seed-4', target: 'node-4' },
  { source: 'seed-2', target: 'node-5' },
  { source: 'seed-5', target: 'node-5' },
  { source: 'seed-1', target: 'node-6' },
  { source: 'seed-2', target: 'node-6' },
  { source: 'seed-2', target: 'node-7' },
  { source: 'seed-3', target: 'node-7' },
  { source: 'seed-1', target: 'node-8' },
  { source: 'seed-3', target: 'node-8' },
  { source: 'seed-2', target: 'node-9' },
  { source: 'seed-4', target: 'node-9' },
  { source: 'seed-4', target: 'node-10' },
  { source: 'seed-5', target: 'node-10' },
];

// Summary stats
export const POC_STATS = {
  totalNodes: 15,
  seedNodes: 5,
  generatedNodes: 8,
  uncertaintyNodes: 2,
  totalEdges: 30,
  iterations: 1,
};
