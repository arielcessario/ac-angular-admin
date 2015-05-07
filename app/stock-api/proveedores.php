<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);

if ($decoded->function == 'getProveedores') {
    getProveedores();
}


function getProveedores(){
    $db = new MysqliDb();

    $results = $db->get('proveedores');

    echo json_encode($results);
}

