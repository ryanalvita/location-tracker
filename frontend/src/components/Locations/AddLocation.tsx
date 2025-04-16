import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
  NativeSelect,
} from "@chakra-ui/react"
import { useState } from "react"
import { FaPlus } from "react-icons/fa"

import { type LocationCreate, LocationsService, ItemsService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

const AddLocation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const { data: itemsResponse, isLoading, error } = useQuery({
    queryKey: ["items"],
    queryFn: () => ItemsService.readItems(),
  })
  const items = itemsResponse?.data || []
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LocationCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      item_id: "",
      latitude: 0,
      longitude: 0,
      datetime: new Date().toISOString(),
    },
  })

  const mutation = useMutation({
    mutationFn: (data: LocationCreate) =>
      LocationsService.createLocation({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Location created successfully.")
      reset()
      setIsOpen(false)
      queryClient.invalidateQueries({ queryKey: ["locations"] })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit: SubmitHandler<LocationCreate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-location" my={4}>
          <FaPlus fontSize="16px" />
          Add Location
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Location</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Fill in the details to add a new location.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.item_id}
                errorText={errors.item_id?.message}
                label="Item Id"
              >
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field placeholder="Select an item" {...register("item_id", { required: "Item Id is required." })}>
                    {isLoading ? (
                      <option>Loading...</option>
                    ) : error ? (
                      <option>Error loading items</option>
                    ) : (
                      items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))
                    )}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field>
              <Field
                required
                invalid={!!errors.latitude}
                errorText={errors.latitude?.message}
                label="Latitude"
              >
                <Input
                  id="latitude"
                  {...register("latitude", { required: "Latitude is required." })}
                  placeholder="Latitude"
                  type="number"
                  step="any"
                />
              </Field>
              <Field
                required
                invalid={!!errors.longitude}
                errorText={errors.longitude?.message}
                label="Longitude"
              >
                <Input
                  id="longitude"
                  {...register("longitude", { required: "Longitude is required." })}
                  placeholder="Longitude"
                  type="number"
                  step="any"
                />
              </Field>
              <Field
                required
                invalid={!!errors.datetime}
                errorText={errors.datetime?.message}
                label="Datetime"
              >
                <Input
                  id="datetime"
                  {...register("datetime", { required: "Datetime is required." })}
                  placeholder="Datetime (ISO 8601)"
                  type="datetime-local"
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button variant="subtle" colorScheme="gray" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default AddLocation