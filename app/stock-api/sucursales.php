<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);

if ($decoded->function == 'getSucursales') {
    getSucursales();
}


function getSucursales(){
    $db = new MysqliDb();

    $results = $db->get('sucursales');

    echo json_encode($results);
}

