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

    $results = $db->rawQuery('Select cliente_id, nombre, apellido, saldo, 0 asientos from clientes where saldo <= -1;');


    foreach ($results as $key => $row) {
//        $movimientos = $db->rawQuery("select movimiento_id from detallesmovimientos where detalle_tipo_id = 3 and valor = ".$row["cliente_id"].");");
        $asientos = $db->rawQuery("select asiento_id, fecha, cuenta_id, sucursal_id, importe, movimiento_id, 0 detalles
from movimientos where cuenta_id like '1.1.2.%' and movimiento_id in
(select movimiento_id from detallesmovimientos where detalle_tipo_id = 3 and valor = " . $row["cliente_id"] . ");");

        foreach ($asientos as $key_mov => $movimento) {
            $detalles = $db->rawQuery("select detalle_tipo_id,
                                      CASE when (detalle_tipo_id = 8) then
                                        (select concat(producto_id, ' - ' , nombre) from productos where producto_id = valor)
                                      when (detalle_tipo_id  != 8) then valor
                                      end valor from detallesmovimientos
                                      where movimiento_id = (select movimiento_id from movimientos where cuenta_id like '4.1.1.%' and asiento_id=" . $movimento["asiento_id"] . ");");
            $asientos[$key_mov]["detalles"] = $detalles;
        }

        $results[$key]["asientos"] = $asientos;
//        $row["detalles"] = $detalle;

//        array_push($deudores, $row);
    }


    echo json_encode($results);
}

function actualizarSaldo($cliente_id, $importe)
{
    $db = new MysqliDb();
//    $data = Array(
//        "saldo" => $importe);
//
//    $db->where("cliente_id", $decoded->cliente_id);


//    $id = $db->update("clientes", $data);
//    if ($id) {
    echo json_encode($db->rawQuery('update clientes set saldo = saldo + ' . $importe . ' where cliente_id = ' . $cliente_id));
//    } else {
//        echo json_encode(Array("Error" => $db->getLastError()));
//    }
}