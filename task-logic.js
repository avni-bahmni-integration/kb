let syncDirections = ["BahmniToAvni", "AvniToBahmni"];
let errorTypes = ["IdChanged", "IdNotFound", "IdFixed"];

function taskIndividual(individual, syncDirection) {
    if (destinationSystemHasIndividualWithSameUuid(individual.uuid) && destinationSystemHasIndividualWithSameSangamNumber(individual.uuid)) {
        updateIndividual(individual);
        safeDeleteErrorRecord(individual.uuid, "Individual", syncDirection);
    } else if (destinationSystemHasIndividualWithSameUuid(individual.uuid) && !destinationSystemHasIndividualWithSameSangamNumber(individual.uuid)) {
        // sangam number changed since last save. we cannot tell where it changed
        createOrUpdateErrorRecord(individual, "PatientSubject", "IdChanged", syncDirection);
    } else if (!destinationSystemHasIndividualWithSameUuid(individual.uuid) && !destinationSystemHasIndividualWithSameSangamNumber(individual.uuid)) {
        createIndividual(individual);
        safeDeleteErrorRecord(individual.uuid, "Individual", syncDirection);
    } else {
        createOrUpdateErrorRecord(individual, "PatientSubject", "IdNotFound", syncDirection);
    }
}

function taskIndividualErrorRecord(individual, errorType, syncDirection) {
    switch (errorType) {
        case "IdChanged":
        case "IdNotFound":
            break;
        case "IdFixed":
            taskIndividual(individual, syncDirection);
            break;
    }
}

//TBD based on discussion with Ashwini about programs. Ideally since the diagnosis happens in the hospital the baseline (enrolment) form should be filled in Bahmni first. The community hence should never enrol anyone directly and only fill their own community baseline form. But given the current process of enrolment in Avni the same process can continue. i.e. the enrolment is done in community.
function taskProgramEnrolment(programEnrolment, syncDirection) {
    if (errorRecordHas(programEnrolment.individualUuid, "Individual", syncDirection)) {
        // There is something wrong with individual (parent) sync
        createOrUpdateErrorRecord(programEnrolment, "ProgramEnrolment", "ErrorInParent", syncDirection);
        return;
    }

    createOrUpdateProgramEnrolment(programEnrolment);
}

function taskProgramEnrolmentErrorRecord(individual, errorType, syncDirection) {

}

//On exception during update or create entity like createIndividual, updateIndividual, createOrUpdateProgramEnrolment "Exception" type of error record is created
//e.g. createOrUpdateErrorRecord(programEnrolment, "ProgramEnrolment", "Exception", syncDirection, e);