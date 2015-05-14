<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);
if($decoded != null) {
    if ($decoded->function == 'save') {
        saveResultados($decoded->resultados);
    }
}else{

    $function = $_GET["function"];
    if ($function == 'getResultados') {
        getResultados();
    }
}

function getResultados(){
    $db = new MysqliDb();
    $db->orderBy('anio');
    $db->orderBy('mes');
    $results = $db->get('resultados');

    echo json_encode($results);
}


function saveResultados($resultados){

}