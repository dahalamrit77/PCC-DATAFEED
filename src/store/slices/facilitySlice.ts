import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { facilityService } from '../../services/facility.service';
import type { Facility } from '../../types/facility.types';

const SELECTED_FACILITY_STORAGE_KEY = 'selected_facility_id';

interface FacilityState {
  facilities: Facility[];
  facilityIds: number[]; // Array of facIds for RBAC
  selectedFacilityId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: FacilityState = {
  facilities: [],
  facilityIds: [],
  selectedFacilityId: null,
  loading: false,
  error: null,
};

/**
 * Fetches facilities from the API.
 * The backend returns different facilities based on user role:
 * - Admin: Returns all facilities [12, 22, 44, 45]
 * - Facility Manager: Returns only their facility [12]
 */
export const fetchFacilities = createAsyncThunk(
  'facility/fetchFacilities',
  async (_, { rejectWithValue }) => {
    try {
      // Use facilityService to avoid circular dependency
      const facilities = await facilityService.getFacilities();

      // Extract facIds from facilities
      const facIds = facilities.map((fac) => fac.facId).sort((a, b) => a - b);

      return {
        facilities: facilities,
        facilityIds: facIds,
      };
    } catch (error) {
      console.error('[facilitySlice] Error fetching facilities:', error);
      return rejectWithValue('Failed to fetch facilities');
    }
  }
);

const facilitySlice = createSlice({
  name: 'facility',
  initialState,
  reducers: {
    /**
     * Sets the active facility ID and saves it to localStorage.
     * This allows users to switch between facilities (Admin only).
     */
    setActiveFacility: (state, action: { payload: number | null; type: string }) => {
      const facilityId = action.payload;
      
      // Allow null for "All Facilities" option
      if (facilityId === null) {
        state.selectedFacilityId = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem(SELECTED_FACILITY_STORAGE_KEY);
        }
        return;
      }
      
      // Validate that the facility ID exists in the available facilities
      if (state.facilityIds.includes(facilityId)) {
        state.selectedFacilityId = facilityId;
        
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(SELECTED_FACILITY_STORAGE_KEY, facilityId.toString());
        }
      } else {
        console.warn(`[facilitySlice] Attempted to set invalid facility ID: ${facilityId}`);
      }
    },
    
    /**
     * Clears the selected facility (useful for logout).
     */
    clearSelectedFacility: (state) => {
      state.selectedFacilityId = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SELECTED_FACILITY_STORAGE_KEY);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.loading = false;
        state.facilities = action.payload.facilities;
        state.facilityIds = action.payload.facilityIds;
        state.error = null;

        // Smart Auto-Selection Logic (RBAC)
        if (action.payload.facilityIds.length === 1) {
          // Single facility user: Auto-select the only facility
          state.selectedFacilityId = action.payload.facilityIds[0];
          if (typeof window !== 'undefined') {
            localStorage.setItem(SELECTED_FACILITY_STORAGE_KEY, action.payload.facilityIds[0].toString());
          }
        } else if (action.payload.facilityIds.length > 1) {
          // Admin user: Default to "All Facilities" (null) initially
          // User can then select a specific facility if needed
          // Check localStorage for saved preference
          if (typeof window !== 'undefined') {
            const savedId = localStorage.getItem(SELECTED_FACILITY_STORAGE_KEY);
            if (savedId) {
              const savedFacilityId = parseInt(savedId, 10);
              // Validate saved ID is still in available facilities
              if (action.payload.facilityIds.includes(savedFacilityId)) {
                state.selectedFacilityId = savedFacilityId;
              } else {
                // Saved ID is invalid, default to "All Facilities"
                state.selectedFacilityId = null;
                localStorage.removeItem(SELECTED_FACILITY_STORAGE_KEY);
              }
            } else {
              // No saved preference, default to "All Facilities"
              state.selectedFacilityId = null;
            }
          } else {
            // Server-side rendering fallback
            state.selectedFacilityId = null;
          }
        } else {
          // No facilities available
          state.selectedFacilityId = null;
        }
      })
      .addCase(fetchFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch facilities';
      });
  },
});

export const { setActiveFacility, clearSelectedFacility } = facilitySlice.actions;
export default facilitySlice.reducer;

