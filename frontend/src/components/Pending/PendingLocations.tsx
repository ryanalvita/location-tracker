import { Table } from "@chakra-ui/react"
import { SkeletonText } from "../ui/skeleton"

const PendingLocations = () => (
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
      {[...Array(5)].map((_, index) => (
        <Table.Row key={index}>
          <Table.Cell>
            <SkeletonText noOfLines={1} />
          </Table.Cell>
          <Table.Cell>
            <SkeletonText noOfLines={1} />
          </Table.Cell>
          <Table.Cell>
            <SkeletonText noOfLines={1} />
          </Table.Cell>
          <Table.Cell>
            <SkeletonText noOfLines={1} />
          </Table.Cell>
          <Table.Cell>
            <SkeletonText noOfLines={1} />
          </Table.Cell>
          <Table.Cell>
            <SkeletonText noOfLines={1} />
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table.Root>
)

export default PendingLocations