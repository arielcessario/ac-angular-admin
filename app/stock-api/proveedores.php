<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);
if ($decoded != null) {
    if ($decoded->function == 'saveProveedor') {
        saveProveedor($decoded->proveedor);
    }elseif($decoded->function == 'updateProveedor'){
        udpateProveedor($decoded->proveedor);
    }elseif($decoded->function == 'deleteProveedor'){
        deleteProveedor($decoded->id);
    }
} else {

    $function = $_GET["function"];
    if ($function == 'getProveedores') {
        getProveedores();
    }

}

function getProveedores()
{
    $db = new MysqliDb();

    $results = $db->get('proveedores');

    echo json_encode($results);
}

function saveProveedor($proveedor)
{
    $db = new MysqliDb();
    $decoded = json_decode($proveedor);

    $data = Array(
        "nombre" => $decoded->nombre,
        "telefono" => $decoded->telefono,
        "cuit" => $decoded->cuit,
        "mail" => $decoded->mail);


    $id = $db->insert("proveedores", $data);
    if ($id) {
        echo $id;
    } else {
        echo json_encode(Array("Error" => $db->getLastError()));
    }
}

function udpateProveedor($proveedor)
{
    $db = new MysqliDb();

    $decoded = json_decode($proveedor);

    $data = Array(
        "nombre" => $decoded->nombre,
        "telefono" => $decoded->telefono,
        "cuit" => $decoded->cuit,
        "mail" => $decoded->mail);

    $db->where("proveedor_id", $decoded->proveedor_id);

    $id = $db->update("proveedores", $data);
    if ($id) {
        echo $id;
    } else {
        echo json_encode(Array("Error" => $db->getLastError()));
    }
}



function deleteProveedor($proveedor){
    $db = new MysqliDb();
//    $item_decoded = json_decode($proveedor);
//    $fotos_decoded = json_decode($producto->fotos);


    $db->where('proveedor_id', $proveedor);


    $results = $db->delete('proveedores');


    $res = ['status' => 1, 'results' => 0];
    if ($results) {

        $res["results"] = 1;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }

}