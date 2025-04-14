import { Container, Heading, Text, Spinner, Table, Tabs } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useParams } from "@tanstack/react-router"
import { ItemsService } from "@/client"
import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import { antPath } from 'leaflet-ant-path';
import { useLeafletContext } from '@react-leaflet/core'
import { sortBy } from 'lodash'

import type { ItemPublic } from "@/client"
import L from "leaflet";


export const Route = createFileRoute("/_layout/items/$itemId")({
  component: ItemPage,
})

function ItemMetadata({ data }: { data: ItemPublic }) {
  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }} mt={6}>
        <Table.Body>
          {Object.keys(data).map((key) => (
            <Table.Row key={key}>
              <Table.Cell truncate maxW="sm">
                {key}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {typeof (data as Record<string, any>)[key] === "object"
                  ? JSON.stringify((data as Record<string, any>)[key])
                  : (data as Record<string, any>)[key]?.toString() || "N/A"}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  )
}

function ItemLocation({ data }: { data: ItemPublic }) {
  function MapBounds({ positions }: { positions: [number, number][] }) {
    const map = useMap()

    useEffect(() => {
      if (positions.length > 0) {
        const bounds = L.latLngBounds(positions)
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }, [positions, map])

    return null
  }
  const itemLocations = data.locations || []
  const sortedLocations = useMemo(() => {
    return sortBy(itemLocations, location => new Date(location.datetime).getTime())
  }, [itemLocations])

  const locations = sortedLocations.map(location => ({
    position: [location.latitude, location.longitude],
    datetime: location.datetime,
    id: location.id,
  }))

  // Get an array of positions for the bounds calculation.
  const positions = locations.map(location => location.position as [number, number])

  // Prepare a path for the AntPath polyline.
  const path = positions
  console.log(path, 'path')

  const AntPath = (p: { positions: any; options: any; }) => {
    const context = useLeafletContext()
    useEffect(() => {
      let antPolyline = antPath(p.positions, p.options)
      context.map.addLayer(antPolyline)
      return () => {
        context.map.removeLayer(antPolyline)
      }
    })
    return null
  }
  const options = { color: 'red', delay: 800 }

  return (
    <div style={{ height: '60vh' }}>
      <MapContainer
        center={positions[0] as [number, number] || [0, 0]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />

        <MapBounds positions={positions} />

        {locations.map((location, index) => (
          <Circle
            key={index}
            center={location.position as [number, number]}
            radius={200}
            color="red"
            fillColor="red"
          />
        ))}

        <AntPath positions={path} options={options} />
      </MapContainer>
      
      <Table.Root size={{ base: "sm", md: "md" }} mt={4}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Datetime</Table.ColumnHeader>
            <Table.ColumnHeader>Latitude</Table.ColumnHeader>
            <Table.ColumnHeader>Longitude</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {locations.map((loc) => (
            <Table.Row key={loc.id}>
              <Table.Cell>{new Date(loc.datetime).toLocaleString()}</Table.Cell>
              <Table.Cell>{loc.position[0]}</Table.Cell>
              <Table.Cell>{loc.position[1]}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  )
};

const tabsConfig = [
  { value: "location", title: "Location", component: ItemLocation },
  { value: "metadata", title: "Metadata", component: ItemMetadata },
]

function ItemPage() {
  const { itemId } = useParams({ from: Route.fullPath })
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["items", itemId],
    queryFn: () => ItemsService.readItem({ id: itemId }),
  })
  console.log(data)

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <Spinner size="xl" />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxW="container.md" py={8}>
        <Text color="red.500">Error loading item</Text>
      </Container>
    )
  }
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12} pb={6}>
        Item Details
      </Heading>
      <Tabs.Root defaultValue="location" variant="subtle">
        <Tabs.List>
          {tabsConfig.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value}>
              {tab.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {tabsConfig.map((tab) => (
          <Tabs.Content key={tab.value} value={tab.value}>
            {data && <tab.component data={data} />}
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Container>
  )
}

export default ItemPage