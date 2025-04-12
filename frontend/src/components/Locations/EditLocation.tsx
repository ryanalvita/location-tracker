import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"

import { type ApiError, type LocationPublic, LocationsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface EditLocationProps {
  location: LocationPublic
}

interface LocationUpdateForm {
  item_id?: string
  latitude?: number
  longitude?: number
  datetime?: string
}

const EditLocation = ({ location }: EditLocationProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LocationUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...location,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: LocationUpdateForm) =>
      LocationsService.updateLocation({ id: location.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Location updated successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] })
    },
  })

  const onSubmit: SubmitHandler<LocationUpdateForm> = async (data) => {
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
        <Button variant="ghost">
          <FaExchangeAlt fontSize="16px" />
          Edit Location
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update the location details below.</Text>
            <VStack gap={4}>
              <Field
                invalid={!!errors.item_id}
                errorText={errors.item_id?.message}
                label="Item Id"
              >
                <Input
                  id="item_id"
                  {...register("item_id", { required: "Item Id is required." })}
                  placeholder="Item Id (UUID)"
                  type="text"
                />
              </Field>
              <Field
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
            <ButtonGroup>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button variant="solid" type="submit" loading={isSubmitting}>
                Save
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default EditLocation
