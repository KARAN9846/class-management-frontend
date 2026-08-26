package com.classmanagement.class_management_system.assignment.controller;

import com.classmanagement.class_management_system.assignment.dto.request.AssignmentRequest;
import com.classmanagement.class_management_system.assignment.dto.response.AssignmentResponse;
import com.classmanagement.class_management_system.assignment.service.AssignmentService;
import com.classmanagement.class_management_system.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
@Tag(
        name = "Assignments",
        description = "APIs for managing student assignments"
)
public class AssignmentController {

    private final AssignmentService assignmentService;

    @Operation(
            summary = "Create assignment",
            description = "Creates a new assignment for a class, section and subject."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Assignment created successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Teacher, class, section, subject or academic year not found"
            )
    })
    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
            @Valid @RequestBody AssignmentRequest request
    ) {

        AssignmentResponse response =
                assignmentService.createAssignment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Assignment created successfully",
                                response
                        )
                );
    }

    @Operation(
            summary = "Get all assignments",
            description = "Retrieves all assignments for the current admin."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Assignments retrieved successfully"
            )
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>>
    getAllAssignments() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Assignments fetched successfully",
                        assignmentService.getAllAssignments()
                )
        );
    }

    @Operation(
            summary = "Get assignment by ID",
            description = "Retrieves an assignment using its ID."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Assignment retrieved successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Assignment not found"
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponse>>
    getAssignmentById(

            @Parameter(
                    description = "Assignment ID",
                    example = "1"
            )
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Assignment fetched successfully",
                        assignmentService.getAssignmentById(id)
                )
        );
    }

    @Operation(
            summary = "Update assignment",
            description = "Updates an existing assignment."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Assignment updated successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Assignment not found"
            )
    })
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponse>>
    updateAssignment(

            @Parameter(
                    description = "Assignment ID",
                    example = "1"
            )
            @PathVariable Long id,

            @Valid @RequestBody AssignmentRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Assignment updated successfully",
                        assignmentService.updateAssignment(id, request)
                )
        );
    }

    @Operation(
            summary = "Delete assignment",
            description = "Deletes an assignment using its ID."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Assignment deleted successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Assignment not found"
            )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>>
    deleteAssignment(

            @Parameter(
                    description = "Assignment ID",
                    example = "1"
            )
            @PathVariable Long id
    ) {

        assignmentService.deleteAssignment(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Assignment deleted successfully",
                        null
                )
        );
    }
}
