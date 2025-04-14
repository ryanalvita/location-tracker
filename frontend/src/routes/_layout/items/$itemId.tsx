import { Container, Heading, Text, Spinner, Table } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useParams } from "@tanstack/react-router"
import { ItemsService } from "@/client"

export const Route = createFileRoute("/_layout/items/$itemId")({
  component: ItemPage,
})


function ItemTable() {
  const { itemId } = useParams<{ itemId: string }>()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["items", itemId],
    queryFn: () => ItemsService.readItem({ id: itemId }),
  })

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
    <>
      <Table.Root size={{ base: "sm", md: "md" }} mt={6}>
        <Table.Body>
          {Object.keys(data).map((key) => (
            <Table.Row key={key}>
              <Table.Cell truncate maxW="sm">
                {key}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {typeof data[key] === "object"
                  ? JSON.stringify(data[key])
                  : data[key]?.toString() || "N/A"}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  )
}

function ItemPage() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Item Details
      </Heading>
      <ItemTable />
    </Container>
  )
}

export default ItemPage