"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X, Search, Loader2 } from "lucide-react";
import { getAllBatchNames, filterStudents } from "../../server/server.js";
import toast from "react-hot-toast";

interface FilterCriteria {
  batch: string;
  rollStart: string;
  rollEnd: string;
}

interface StudentFilterProps {
  onFilterResults: (results: any) => void;
  onClearFilter: () => void;
  currentPage: number;
  pageSize: number;
}

export function StudentFilter({
  onFilterResults,
  onClearFilter,
  currentPage,
  pageSize,
}: StudentFilterProps) {
  const [filters, setFilters] = useState<FilterCriteria>({
    batch: "",
    rollStart: "",
    rollEnd: "",
  });
  const [batchNames, setBatchNames] = useState<string[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasActiveFilter, setHasActiveFilter] = useState(false);

  // Fetch batch names on component mount
  useEffect(() => {
    fetchBatchNames();
  }, []);

  const fetchBatchNames = async () => {
    try {
      setIsLoadingBatches(true);
      const batches = await getAllBatchNames();
      setBatchNames(batches);
    } catch (error) {
      console.error("Error fetching batch names:", error);
      toast.error("Failed to load batch names");
      setBatchNames([]);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const validateFilters = () => {
    const { batch, rollStart, rollEnd } = filters;

    // At least one filter must be provided
    if (!batch && !rollStart && !rollEnd) {
      return "Please provide at least one filter criteria";
    }

    // If roll range is provided, both start and end should be valid
    if ((rollStart && !rollEnd) || (!rollStart && rollEnd)) {
      return "Please provide both roll start and roll end numbers";
    }

    if (rollStart && rollEnd) {
      const start = parseInt(rollStart);
      const end = parseInt(rollEnd);

      if (isNaN(start) || isNaN(end)) {
        return "Roll numbers must be valid numbers";
      }

      if (start < 1) {
        return "Roll start number must be at least 1";
      }

      if (end <= start) {
        return "Roll end number must be greater than start number";
      }
    }

    return null;
  };

  const handleFilter = async () => {
    const validationError = validateFilters();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsFiltering(true);

    try {
      const filterParams: any = {
        page: currentPage,
        limit: pageSize,
      };

      if (filters.batch) filterParams.batch = filters.batch;
      if (filters.rollStart)
        filterParams.rollStart = parseInt(filters.rollStart);
      if (filters.rollEnd) filterParams.rollEnd = parseInt(filters.rollEnd);

      console.log("Applying filters:", filterParams);

      const results = await filterStudents(filterParams);

      if (results.success) {
        onFilterResults(results);
        setHasActiveFilter(true);

        const totalRecords = results.pagination?.total || 0;
        const appliedFilters = [];
        if (filters.batch) appliedFilters.push(`Batch: ${filters.batch}`);
        if (filters.rollStart && filters.rollEnd) {
          appliedFilters.push(`Roll: ${filters.rollStart}-${filters.rollEnd}`);
        }

        toast.success(
          `Filter applied! Found ${totalRecords} students. ${appliedFilters.join(
            ", "
          )}`
        );
      } else {
        throw new Error(results.message || "Filter failed");
      }
    } catch (error) {
      console.error("Error applying filter:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Filter failed";
      toast.error(`Filter failed: ${errorMessage}`);
    } finally {
      setIsFiltering(false);
    }
  };

  const handleClearFilter = () => {
    setFilters({
      batch: "",
      rollStart: "",
      rollEnd: "",
    });
    setHasActiveFilter(false);
    onClearFilter();
    toast.success("Filter cleared. Showing all students.");
  };

  const isFilterEmpty =
    !filters.batch && !filters.rollStart && !filters.rollEnd;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filter Students
          {hasActiveFilter && (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Active Filter
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Batch Filter */}
          <div className="space-y-2">
            <Label htmlFor="batch">Batch</Label>
            <Select
              value={filters.batch}
              onValueChange={(value) =>
                setFilters({ ...filters, batch: value === "ALL" ? "" : value })
              }
              disabled={isLoadingBatches}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingBatches ? "Loading batches..." : "Select batch"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isLoadingBatches ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  </SelectItem>
                ) : (
                  <>
                    <SelectItem value="ALL">All Batches</SelectItem>
                    {batchNames
                      .filter((batch) => batch !== "ALL")
                      .map((batch) => (
                        <SelectItem key={batch} value={batch}>
                          {batch}
                        </SelectItem>
                      ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Roll Start Filter */}
          <div className="space-y-2">
            <Label htmlFor="rollStart">Roll Start</Label>
            <Input
              id="rollStart"
              type="number"
              min="1"
              value={filters.rollStart}
              onChange={(e) =>
                setFilters({ ...filters, rollStart: e.target.value })
              }
              placeholder="e.g., 1011"
              disabled={isFiltering}
            />
          </div>

          {/* Roll End Filter */}
          <div className="space-y-2">
            <Label htmlFor="rollEnd">Roll End</Label>
            <Input
              id="rollEnd"
              type="number"
              min="1"
              value={filters.rollEnd}
              onChange={(e) =>
                setFilters({ ...filters, rollEnd: e.target.value })
              }
              placeholder="e.g., 2034"
              disabled={isFiltering}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <Button
              onClick={handleFilter}
              disabled={isFiltering || isFilterEmpty}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isFiltering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isFiltering ? "Filtering..." : "Apply Filter"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilter}
              disabled={isFiltering || (!hasActiveFilter && isFilterEmpty)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* Filter Summary */}
        {hasActiveFilter && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <strong>Active Filters:</strong>
              <div className="mt-1 flex flex-wrap gap-2">
                {filters.batch && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Batch: {filters.batch}
                  </span>
                )}
                {filters.rollStart && filters.rollEnd && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Roll Range: {filters.rollStart} - {filters.rollEnd}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
