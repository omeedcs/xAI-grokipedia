// POC Seed Articles: The Implementation of the Container Shipping Standard (ISO 668)
// These are Generation 0 (N₀) - 5 high-confidence seed nodes

import type { KnowledgeNode } from '../types/knowledge';
import { createSeedNodeMetrics } from '../services/generationCycle';

const timestamp = new Date().toISOString();

export const ISO668_SEED_ARTICLES: KnowledgeNode[] = [
  {
    id: 'seed-A1-intermodalism',
    title: 'The Concept of Intermodalism',
    slug: 'concept-of-intermodalism',
    content: `# The Concept of Intermodalism

Intermodalism refers to the transportation philosophy of moving cargo between different modes of transport—rail, ship, and truck—without directly handling the contents. This concept emerged in the early 20th century as industrial logistics began to recognize the inefficiencies of break-bulk cargo handling.

## Historical Context

Prior to intermodal systems, cargo was loaded and unloaded at each transfer point. A shipment from a factory to an overseas destination might be:
1. Loaded onto a truck at the factory
2. Unloaded at a rail terminal
3. Loaded onto a rail car
4. Unloaded at a port
5. Loaded onto a ship (piece by piece into the hold)
6. Unloaded at the destination port
7. Loaded onto local transport

Each handling event introduced:
- **Labor costs**: Longshoremen, stevedores, warehouse workers
- **Time delays**: Hours to days at each transfer point
- **Damage risk**: Each touch point increased breakage and loss
- **Pilferage**: Exposed cargo was vulnerable to theft

## The Intermodal Vision

The core insight was simple: if cargo could remain in a single sealed container throughout its journey, the container itself becomes the unit of transfer—not the goods inside. This would transform logistics from a labor-intensive handling operation to a capital-intensive lifting operation.

## Efficiency Metrics

The theoretical efficiency gain of intermodalism:
- **Handling reduction**: From 10+ touch points to 4-6 lift operations
- **Time savings**: Potential 80-90% reduction in port dwell time
- **Labor reduction**: Fewer workers needed per ton of cargo
- **Security improvement**: Sealed containers reduce theft and damage`,

    sourceNodes: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    generationMethod: 'seed',

    confidence: 1.0,
    verificationStatus: 'verified',

    metrics: createSeedNodeMetrics(),

    claims: [
      {
        id: 'claim-A1-1',
        text: 'Intermodalism is the transportation of cargo between different modes without handling the contents directly.',
        confidence: 1.0,
        verified: true,
        domain: 'logistics',
      },
      {
        id: 'claim-A1-2',
        text: 'Break-bulk cargo handling required loading and unloading at each transfer point.',
        confidence: 1.0,
        verified: true,
        domain: 'logistics',
      },
    ],
    citations: [],
    domains: ['logistics', 'economics', 'history'],
    entities: ['Intermodalism', 'Break-bulk cargo'],
    annotations: [],
    tags: ['seed', 'N0', 'iso-668-poc'],
  },

  {
    id: 'seed-A2-mclean-acquisition',
    title: "Malcolm McLean's Acquisition of Pan-Atlantic Steamship Company (1955)",
    slug: 'mclean-pan-atlantic-acquisition-1955',
    content: `# Malcolm McLean's Acquisition of Pan-Atlantic Steamship Company (1955)

In 1955, Malcolm Purcell McLean, a trucking entrepreneur from North Carolina, purchased the Pan-Atlantic Steamship Company for approximately $7 million. This acquisition marked the pivotal moment when containerized shipping transitioned from theoretical concept to commercial implementation.

## Background: McLean's Trucking Empire

McLean had built McLean Trucking Company from a single truck in 1934 to one of the largest trucking firms in the American South by the 1950s. His experience with road freight gave him intimate knowledge of:
- The cost structure of cargo handling
- The time losses at intermodal transfer points
- The inefficiencies of the existing maritime-trucking interface

## The Strategic Vision

McLean's insight was not merely to use containers, but to design an integrated system where:
1. Truck trailers could be loaded at origin
2. The entire trailer (or just the container body) would be lifted onto a ship
3. At destination, the container would be placed directly onto a truck chassis

## The Acquisition Terms

- **Purchase price**: ~$7 million for Pan-Atlantic Steamship Company
- **Fleet**: Several aging cargo vessels
- **Routes**: Primarily U.S. East Coast and Gulf ports
- **Regulatory requirement**: McLean was forced to divest his trucking company to comply with ICC regulations separating trucking and shipping interests

## First Container Voyage

On April 26, 1956, the converted tanker SS Ideal X sailed from Newark to Houston carrying 58 aluminum truck bodies. This voyage demonstrated:
- **Loading time**: 58 containers loaded in under 8 hours
- **Cost per ton**: Estimated at $0.16 per ton vs. $5.83 for conventional break-bulk
- **Labor reduction**: Fraction of the longshoremen typically required

## Efficiency Delta

The first containerized voyage achieved a **97% reduction in loading cost per ton** compared to conventional break-bulk methods.`,

    sourceNodes: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    generationMethod: 'seed',

    confidence: 1.0,
    verificationStatus: 'verified',

    metrics: createSeedNodeMetrics(),

    claims: [
      {
        id: 'claim-A2-1',
        text: 'Malcolm McLean purchased Pan-Atlantic Steamship Company in 1955 for approximately $7 million.',
        confidence: 1.0,
        verified: true,
        domain: 'history',
      },
      {
        id: 'claim-A2-2',
        text: 'The SS Ideal X sailed from Newark to Houston on April 26, 1956 carrying 58 containers.',
        confidence: 1.0,
        verified: true,
        domain: 'history',
      },
      {
        id: 'claim-A2-3',
        text: 'Container loading cost was approximately $0.16 per ton compared to $5.83 for break-bulk.',
        confidence: 0.9,
        verified: true,
        domain: 'economics',
      },
    ],
    citations: [],
    domains: ['history', 'economics', 'logistics'],
    entities: ['Malcolm McLean', 'Pan-Atlantic Steamship Company', 'SS Ideal X', 'Newark', 'Houston'],
    annotations: [],
    tags: ['seed', 'N0', 'iso-668-poc'],
  },

  {
    id: 'seed-A3-inefficient-status-quo',
    title: 'The Inefficient Status Quo: Break-Bulk Cargo Handling in 1950',
    slug: 'break-bulk-inefficiency-1950',
    content: `# The Inefficient Status Quo: Break-Bulk Cargo Handling in 1950

By 1950, the global maritime shipping industry operated on methods fundamentally unchanged since the 19th century. The "break-bulk" system required manual handling of individual cargo items, creating massive inefficiencies that would eventually drive the container revolution.

## Quantified Inefficiency Metrics

### Labor Requirements
- **Longshoremen per ship**: 20-25 gangs of workers
- **Gang size**: 15-20 men per gang
- **Total workers per vessel**: 300-500 longshoremen for a single ship
- **Work hours per ton**: 2.5-4 man-hours to move one ton of cargo

### Time Metrics
- **Port dwell time**: 7-14 days average for a cargo vessel
- **Actual sailing time**: Often less than 50% of total voyage time
- **Loading rate**: 10-15 tons per gang per hour
- **Total throughput**: 200-300 tons per day for entire ship

### Cost Structure (1950 USD)
- **Handling cost**: $5.00-$6.00 per ton
- **Port charges**: $0.50-$1.00 per ton per day
- **Total port costs**: Often exceeded ocean freight costs
- **Cargo damage rate**: 5-10% of shipments

### The Physical Process

A typical break-bulk operation involved:
1. Cargo arrives at pier via truck or rail (separate pieces)
2. Goods sorted and staged in transit sheds
3. Longshoremen carry or cart goods to shipside
4. Goods placed in cargo nets or slings
5. Ship's winches lift cargo into hold
6. Stevedores stow cargo piece-by-piece
7. Process reverses at destination

## Bottleneck Analysis

The fundamental constraint was **the ship's cargo hatch**. Only one or two gangs could work a single hatch simultaneously, creating a physical bottleneck regardless of labor availability.

## Economic Pressure

By 1950, port handling costs represented **60-75% of total door-to-door shipping costs** for many routes. This created enormous economic pressure for innovation.`,

    sourceNodes: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    generationMethod: 'seed',

    confidence: 1.0,
    verificationStatus: 'verified',

    metrics: createSeedNodeMetrics(),

    claims: [
      {
        id: 'claim-A3-1',
        text: 'Break-bulk cargo handling required 2.5-4 man-hours to move one ton of cargo.',
        confidence: 0.95,
        verified: true,
        domain: 'economics',
      },
      {
        id: 'claim-A3-2',
        text: 'Average port dwell time for cargo vessels was 7-14 days in 1950.',
        confidence: 0.95,
        verified: true,
        domain: 'logistics',
      },
      {
        id: 'claim-A3-3',
        text: 'Handling cost was $5.00-$6.00 per ton in 1950.',
        confidence: 0.9,
        verified: true,
        domain: 'economics',
      },
      {
        id: 'claim-A3-4',
        text: 'Port handling costs represented 60-75% of total door-to-door shipping costs.',
        confidence: 0.9,
        verified: true,
        domain: 'economics',
      },
    ],
    citations: [],
    domains: ['economics', 'logistics', 'history'],
    entities: ['Break-bulk', 'Longshoremen', 'Stevedores'],
    annotations: [],
    tags: ['seed', 'N0', 'iso-668-poc'],
  },

  {
    id: 'seed-A4-necessity-of-standard',
    title: 'The Necessity of a Standard: Early Container Incompatibility Crisis',
    slug: 'container-incompatibility-crisis',
    content: `# The Necessity of a Standard: Early Container Incompatibility Crisis

Following the success of McLean's containerized operations, multiple shipping companies rushed to implement their own container systems between 1956-1965. However, each company developed proprietary container dimensions, creating a new form of logistical chaos that threatened to undermine the efficiency gains of containerization itself.

## The Proliferation of Incompatible Standards

### Competing Container Dimensions (1956-1965)

| Company/System | Length | Width | Height |
|----------------|--------|-------|--------|
| Sea-Land (McLean) | 35 ft | 8 ft | 8 ft |
| Matson Navigation | 24 ft | 8 ft | 8.5 ft |
| Grace Line | 17 ft | 8 ft | 8 ft |
| Alaska Steamship | 24 ft | 8 ft | 8 ft |
| U.S. Military (CONEX) | 8.5 ft | 6.25 ft | 6.83 ft |
| European variants | Various metric dimensions |

## Consequences of Non-Standardization

### Infrastructure Duplication
- **Cranes**: Each terminal needed multiple crane spreaders
- **Chassis**: Trucking companies needed different trailer types
- **Ships**: Vessels designed for one system couldn't efficiently carry others
- **Rail**: Railcars required custom fittings

### Operational Inefficiencies
- **Interline transfers impossible**: Containers couldn't move between carriers
- **Empty repositioning**: Containers had to return to originating carrier
- **Port congestion**: Separate handling areas for each container type
- **Investment uncertainty**: Which standard would prevail?

## Quantified Losses

Studies from the early 1960s estimated that container incompatibility was costing the industry:
- **15-25% efficiency loss** compared to theoretical standardized operations
- **$100-200 million annually** in duplicated infrastructure
- **40% empty container movements** due to repositioning requirements

## The Standards Battle

By 1961, the American Standards Association (ASA) formed a committee (MH-5) to address container standardization. Key stakeholders included:
- Shipping lines (competing interests)
- Port authorities (seeking efficiency)
- Trucking industry (demanding highway-compatible dimensions)
- Railroad industry (constrained by tunnel clearances)
- U.S. Maritime Administration (seeking military compatibility)

The lack of a universal standard was preventing containerization from achieving its full potential.`,

    sourceNodes: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    generationMethod: 'seed',

    confidence: 1.0,
    verificationStatus: 'verified',

    metrics: createSeedNodeMetrics(),

    claims: [
      {
        id: 'claim-A4-1',
        text: 'Multiple shipping companies developed incompatible proprietary container dimensions between 1956-1965.',
        confidence: 1.0,
        verified: true,
        domain: 'history',
      },
      {
        id: 'claim-A4-2',
        text: 'Container incompatibility caused 15-25% efficiency loss compared to standardized operations.',
        confidence: 0.85,
        verified: true,
        domain: 'economics',
      },
      {
        id: 'claim-A4-3',
        text: 'The American Standards Association formed committee MH-5 in 1961 to address container standardization.',
        confidence: 0.95,
        verified: true,
        domain: 'history',
      },
    ],
    citations: [],
    domains: ['logistics', 'economics', 'technology'],
    entities: ['Sea-Land', 'Matson Navigation', 'American Standards Association', 'MH-5 Committee'],
    annotations: [],
    tags: ['seed', 'N0', 'iso-668-poc'],
  },

  {
    id: 'seed-A5-iso-668-establishment',
    title: 'Establishment of ISO 668: The Container Dimension Standard (1968)',
    slug: 'iso-668-establishment-1968',
    content: `# Establishment of ISO 668: The Container Dimension Standard (1968)

In 1968, the International Organization for Standardization (ISO) published ISO 668, establishing the definitive global standard for freight container dimensions. This standard created the foundation for the modern intermodal shipping system by defining the 20-foot equivalent unit (TEU) and related container sizes.

## The Standard Specifications

### ISO 668 Defined Container Series

| Designation | External Length | External Width | External Height |
|-------------|-----------------|----------------|-----------------|
| 1AAA | 40 ft (12.192 m) | 8 ft (2.438 m) | 9 ft 6 in (2.896 m) |
| 1AA | 40 ft (12.192 m) | 8 ft (2.438 m) | 8 ft 6 in (2.591 m) |
| 1A | 40 ft (12.192 m) | 8 ft (2.438 m) | 8 ft (2.438 m) |
| 1CC | 20 ft (6.096 m) | 8 ft (2.438 m) | 8 ft 6 in (2.591 m) |
| 1C | 20 ft (6.096 m) | 8 ft (2.438 m) | 8 ft (2.438 m) |

### The TEU: A Universal Metric

The 20-foot container (1C/1CC) became the **Twenty-foot Equivalent Unit (TEU)**—the standard measure of container ship capacity and port throughput worldwide.

- 1 TEU = 20 ft × 8 ft × 8 ft container
- 1 FEU (Forty-foot Equivalent Unit) = 2 TEU

## Corner Casting Standardization

Critically, ISO 668 also standardized the **corner castings**—the reinforced corners used for lifting and securing containers. This ensured:
- Any ISO container could be lifted by any compliant crane
- Containers could be stacked securely regardless of manufacturer
- Twist-lock mechanisms were universally compatible

## Adoption Timeline

- **1968**: ISO 668 published
- **1970**: Major shipping lines begin conversion
- **1972**: Most new container ships built to ISO specifications
- **1975**: ISO containers dominate international trade
- **1980**: Break-bulk cargo reduced to <20% of general cargo

## Efficiency Impact

Post-ISO 668 standardization metrics:
- **Crane utilization**: Single spreader design handles all containers
- **Port throughput**: Increased from 10-15 tons/gang/hour to 400+ TEU/crane/day
- **Ship turnaround**: Reduced from 7-14 days to 24-48 hours
- **Handling cost**: Dropped from $5-6/ton to <$0.20/ton
- **Container utilization**: Interline transfers enabled 30%+ improvement in empty repositioning

## The Standard's Legacy

ISO 668 remains the foundation of global container shipping. As of 2020:
- **800+ million TEU** moved annually worldwide
- **95% of non-bulk cargo** moves in ISO containers
- **Container ship capacity** exceeds 24,000 TEU on largest vessels`,

    sourceNodes: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    generationMethod: 'seed',

    confidence: 1.0,
    verificationStatus: 'verified',

    metrics: createSeedNodeMetrics(),

    claims: [
      {
        id: 'claim-A5-1',
        text: 'ISO 668 was published in 1968 establishing global container dimension standards.',
        confidence: 1.0,
        verified: true,
        domain: 'history',
      },
      {
        id: 'claim-A5-2',
        text: 'The standard 20-foot container (TEU) measures 20 ft × 8 ft × 8 ft externally.',
        confidence: 1.0,
        verified: true,
        domain: 'technology',
      },
      {
        id: 'claim-A5-3',
        text: 'Post-standardization handling costs dropped from $5-6/ton to less than $0.20/ton.',
        confidence: 0.9,
        verified: true,
        domain: 'economics',
      },
      {
        id: 'claim-A5-4',
        text: 'Ship turnaround time reduced from 7-14 days to 24-48 hours after containerization.',
        confidence: 0.9,
        verified: true,
        domain: 'logistics',
      },
    ],
    citations: [],
    domains: ['technology', 'economics', 'logistics', 'history'],
    entities: ['ISO 668', 'ISO', 'TEU', 'Twenty-foot Equivalent Unit', 'Corner Castings'],
    annotations: [],
    tags: ['seed', 'N0', 'iso-668-poc'],
  },
];

// Export helper to get seed articles as graph nodes
export function getSeedArticlesForGraph(): Array<{
  id: string;
  label: string;
  content: string;
  isGenerated: boolean;
  isUncertainty: boolean;
}> {
  return ISO668_SEED_ARTICLES.map((article) => ({
    id: article.id,
    label: article.title,
    content: article.content,
    isGenerated: false,
    isUncertainty: false,
  }));
}
