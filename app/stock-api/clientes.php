<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);

if ($decoded->function == 'getClientes') {
    getClientes();
} elseif ($decoded->function == 'save') {
    save($decoded->cliente);
} elseif ($decoded->function == 'deleteCliente') {
    deleteCliente($decoded->id);
} elseif ($decoded->function == 'update') {
    update($decoded->cliente);
} elseif ($decoded->function == 'getDeudores') {
    getDeudores();
} elseif ($decoded->function == 'actualizarSaldo') {
    actualizarSaldo($decoded->cliente_id, $decoded->importe);
}


function getClientes()
{
    $db = new MysqliDb();

    $results = $db->get('clientes');

    echo json_encode($results);
}

function save($cliente)
{
    $db = new MysqliDb();
    $decoded = json_decode($cliente);

    $data = Array(
        "nombre" => $decoded->nombre,
        "apellido" => $decoded->apellido,
        "mail" => $decoded->mail,
        "nacionalidad_id" => $decoded->nacionalidad_id,
        "tipo_doc" => $decoded->tipo_doc,
        "nro_doc" => $decoded->nro_doc,
        "comentarios" => $decoded->comentarios,
        "marcado" => $decoded->marcado,
        "fecha_nacimiento" => $decoded->fecha_nacimiento);


    $id = $db->insert("clientes", $data);
    if ($id) {
        echo $id;
    } else {
        echo json_encode(Array("Error" => $db->getLastError()));
    }
}

function update($item)
{

    $db = new MysqliDb();

    $decoded = json_decode($item);

    $data = Array(
        "nombre" => $decoded->nombre,
        "apellido" => $decoded->apellido,
        "mail" => $decoded->mail,
        "nacionalidad_id" => $decoded->nacionalidad_id,
        "tipo_doc" => $decoded->tipo_doc,
        "nro_doc" => $decoded->nro_doc,
        "comentarios" => $decoded->comentarios,
        "marcado" => $decoded->marcado,
        "fecha_nacimiento" => $decoded->fecha_nacimiento);

    $db->where("cliente_id", $decoded->cliente_id);

    $id = $db->update("clientes", $data);
    if ($id) {
        echo $id;
    } else {
        echo json_encode(Array("Error" => $db->getLastError()));
    }

}

function deleteCliente($cliente)
{
    $db = new MysqliDb();
//    $item_decoded = json_decode($cliente);
//    $fotos_decoded = json_decode($producto->fotos);


    $db->where('cliente_id', $cliente);


    $results = $db->delete('clientes');


    $res = ['status' => 1, 'results' => 0];
    if ($results) {

        $res["results"] = 1;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }

}

function getDeudores()
{

    $db = new MysqliDb();
    $deudores = array();

    $results = $db->rawQuery('Select cliente_id, nombre, apellido, saldo, 0 detalles from clientes where saldo>0;');

    foreach ($results as $row) {

        $detalle = $db->rawQuery("select * from movimientos where cuenta_id like '1.1.2.%' and movimiento_id in
(select movimiento_id from detallesmovimientos where detalle_tipo_id = 3 and valor = ".$row["cliente_id"].");");

        $row["detalles"] = $detalle;

        array_push($deudores, $row);
    }

    echo json_encode($deudores);
}

function actualizarSaldo($cliente_id, $importe){
    $db = new MysqliDb();
//    $data = Array(
//        "saldo" => $importe);
//
//    $db->where("cliente_id", $decoded->cliente_id);




//    $id = $db->update("clientes", $data);
//    if ($id) {
        echo $db->rawQuery('update clientes set saldo = saldo + ' . $importe .'where cliente_id = ' . $cliente_id);
//    } else {
//        echo json_encode(Array("Error" => $db->getLastError()));
//    }
}