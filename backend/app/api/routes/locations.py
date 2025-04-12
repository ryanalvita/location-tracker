import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Location, LocationCreate, LocationPublic, LocationsPublic, LocationUpdate, Message

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("/", response_model=LocationsPublic)
def read_locations(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve locations.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Location)
        count = session.exec(count_statement).one()
        statement = select(Location).offset(skip).limit(limit)
        locations = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Location)
            .where(Location.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Location)
            .where(Location.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        locations = session.exec(statement).all()

    return LocationsPublic(data=locations, count=count)


@router.get("/{id}", response_model=LocationPublic)
def read_location(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get location by ID.
    """
    location = session.get(Location, id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    if not current_user.is_superuser and (location.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return location


@router.post("/", response_model=LocationPublic)
def create_location(
    *, session: SessionDep, current_user: CurrentUser, location_in: LocationCreate
) -> Any:
    """
    Create new location.
    """
    location = Location.model_validate(location_in, update={"owner_id": current_user.id})
    session.add(location)
    session.commit()
    session.refresh(location)
    return location


@router.put("/{id}", response_model=LocationPublic)
def update_location(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    location_in: LocationUpdate,
) -> Any:
    """
    Update an location.
    """
    location = session.get(Location, id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    if not current_user.is_superuser and (location.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = location_in.model_dump(exclude_unset=True)
    location.sqlmodel_update(update_dict)
    session.add(location)
    session.commit()
    session.refresh(location)
    return location


@router.delete("/{id}")
def delete_location(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an location.
    """
    location = session.get(Location, id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    if not current_user.is_superuser and (location.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(location)
    session.commit()
    return Message(message="Location deleted successfully")
