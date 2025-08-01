"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { getAllKits, getAllBatches, getAllStudents, } from "../../server/server.js"
import { Student, Kit, Batch } from "./types"

export function useStudentData() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5);
  const [kits, setKits] = useState<Kit[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchNames, setBatchNames] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchKitsAndBatches = async () => {
    try {
      const kitsResponse = await getAllKits();
      setKits(kitsResponse);
      const batchesResponse = await getAllBatches();
      setBatches(batchesResponse);
    } catch (error) {
      setKits([]);
      setBatches([]);
      toast.error("Error fetching kits or batches");
    }
  };

  const fetchStudents = async (page: number) => {
    try {
      setIsLoading(true);
      let studentsResponse = await getAllStudents({ page, limit: pageSize });
      let studentsArr: any[] = [];
      let total = 1;
      
      if (Array.isArray(studentsResponse)) {
        studentsArr = studentsResponse;
      } else if (studentsResponse && Array.isArray(studentsResponse.students)) {
        studentsArr = studentsResponse.students;
        total = studentsResponse.totalPages || studentsResponse.total || 1;
      }
      
      // Sort ascending by rollNo or createdAt if available
      studentsArr.sort((a: any, b: any) => {
        if (a.rollNo && b.rollNo) {
          return String(a.rollNo).localeCompare(String(b.rollNo), undefined, { numeric: true });
        }
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
      });
      
      setStudents(studentsArr);
      setTotalPages(total);
      
      // Fetch batch names for all students
      if (studentsArr && studentsArr.length > 0) {
        const batchIds = [...new Set(studentsArr.map((student: any) => student.batch).filter(Boolean))] as string[];
        const batchNamesMap: {[key: string]: string} = {};
        
        // await Promise.all(
        //   batchIds.map(async (batchId: string) => {
        //     try {
        //       const batchResponse = await getBatchById(batchId);
        //       if (batchResponse && batchResponse.name) {
        //         batchNamesMap[batchId] = batchResponse.name;
        //       }
        //     } catch (error) {
        //       console.error(`Error fetching batch ${batchId}:`, error);
        //       batchNamesMap[batchId] = "No batch allotted";
        //     }
        //   })
        // );
        
        setBatchNames(batchNamesMap);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
      toast.error("Error fetching students");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStudents = async () => {
    await fetchStudents(currentPage);
  };

  useEffect(() => {
    fetchKitsAndBatches();
  }, []);

  useEffect(() => {
    fetchStudents(currentPage);
  }, [currentPage, pageSize]);

  return {
    students,
    currentPage,
    totalPages,
    pageSize,
    kits,
    batches,
    batchNames,
    isLoading,
    setCurrentPage,
    refreshStudents
  };
}
