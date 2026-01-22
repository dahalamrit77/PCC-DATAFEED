/**
 * Facility Slice
 * Manages facility selection state (UI state only)
 * Facility data is fetched via RTK Query (facilityApi)
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { storage } from '../../../shared/lib/storage';

interface FacilityState {
  facilityIds: number[]; // Array of facIds for RBAC (populated from RTK Query)
  selectedFacilityId: number | null;
}

const initialState: FacilityState = {
  facilityIds: [],
  selectedFacilityId: storage.getSelectedFacilityId(),
};

const facilitySlice = createSlice({
  name: 'facility',
  initialState,
  reducers: {
    /**
     * Sets the facility IDs available to the user (from RTK Query)
     */
    setFacilityIds: (state, action: PayloadAction<number[]>) => {
      state.facilityIds = action.payload.sort((a, b) => a - b);

      // Auto-select logic
      if (action.payload.length === 1) {
        // Single facility user: Auto-select the only facility
        state.selectedFacilityId = action.payload[0];
        storage.setSelectedFacilityId(action.payload[0]);
      } else if (action.payload.length > 1) {
        // Admin user: Check localStorage for saved preference
        const savedId = storage.getSelectedFacilityId();
        if (savedId && action.payload.includes(savedId)) {
          state.selectedFacilityId = savedId;
        } else {
          // Default to "All Facilities" (null)
          state.selectedFacilityId = null;
          storage.removeSelectedFacilityId();
        }
      } else {
        state.selectedFacilityId = null;
      }
    },

    /**
     * Sets the active facility ID and saves it to localStorage.
     * This allows users to switch between facilities (Admin only).
     */
    setActiveFacility: (state, action: PayloadAction<number | null>) => {
      const facilityId = action.payload;

      // Allow null for "All Facilities" option
      if (facilityId === null) {
        state.selectedFacilityId = null;
        storage.removeSelectedFacilityId();
        return;
      }

      // Validate that the facility ID exists in the available facilities
      if (state.facilityIds.includes(facilityId)) {
        state.selectedFacilityId = facilityId;
        storage.setSelectedFacilityId(facilityId);
      }
    },

    /**
     * Clears the selected facility (useful for logout).
     */
    clearSelectedFacility: (state) => {
      state.selectedFacilityId = null;
      storage.removeSelectedFacilityId();
    },
  },
});

export const { setFacilityIds, setActiveFacility, clearSelectedFacility } =
  facilitySlice.actions;
export default facilitySlice.reducer;
