import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
  Text,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"
import { z } from "zod"

import { LocationsService } from "@/client"
import AddLocation from "@/components/Locations/AddLocation"
import PendingLocations from "@/components/Pending/PendingLocations"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"

const locationsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getLocationsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      LocationsService.readLocations({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["locations", { page }],
  }
}

export const Route = createFileRoute("/_layout/locations")({
  component: Locations,
  validateSearch: (search) => locationsSearchSchema.parse(search),
})

function LocationsTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getLocationsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    })

  const locations = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  if (isLoading) {
    return <PendingLocations />
  }

  if (locations.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>No locations found</EmptyState.Title>
            <EmptyState.Description>
              Add a new location to get started.
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    )
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Item ID</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Latitude</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Longitude</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Datetime</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {locations.map((location) => (
            <Table.Row key={location.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">
                {location.id}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {location.item_id}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {location.latitude}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {location.longitude}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {new Date(location.datetime).toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                {/* Here you can add actions like edit or delete, similar to <ItemActionsMenu /> */}
                <Text fontSize="sm" color="gray.500">
                  N/A
                </Text>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  )
}

function Locations() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Locations Management
      </Heading>
      <AddLocation />
      <LocationsTable />
    </Container>
  )
}

export default Locations