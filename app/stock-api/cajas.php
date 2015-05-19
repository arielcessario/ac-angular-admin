<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);
if ($decoded != null) {
    if ($decoded->function == 'getCajaDiaria') {
        getCajaDiaria($decoded->sucursal_id);
    } else if ($decoded->function == 'cerrarCaja') {
        cerrarCaja($decoded->importe, $decoded->sucursal_id);
    } else if ($decoded->function == 'getSaldoFinal') {
        getSaldoFinal($decoded->sucursal_id);
    } else if ($decoded->function == 'abrirCaja') {
        abrirCaja($decoded->importe, $decoded->sucursal_id);
    }
} else {

    $function = $_GET["function"];
    if ($function == 'getCajaDiaria') {
        getCajaDiaria($_GET["sucursal_id"]);
    } else if ($function == 'getSaldoInicial') {
        getSaldoInicial($_GET["sucursal_id"]);
    } else if ($function == 'getCajas') {
        getCajas();
    } else if ($function == 'getCajaDiariaFromTo') {
        getCajaDiariaFromTo($_GET["sucursal_id"], $_GET["asiento_id_inicio"], $_GET["asiento_id_fin"]);
    } else if ($function == 'getMovimientos') {
        getMovimientos($_GET["fecha_desde"], $_GET["fecha_hasta"]);
    } else if ($function == 'totalConcepto') {
        totalConcepto($_GET["where"], $_GET["fecha_desde"], $_GET["fecha_hasta"]);
    } else if ($function == 'checkEstado') {
        checkEstado($_GET["sucursal_id"]);
    } else if ($function == 'getSaldoFinalAnterior') {
        getSaldoFinalAnterior($_GET["sucursal_id"]);
    }


}

// Movimientos que modifican el estado de cuentas
function getMovimientos($fecha_desde, $fecha_hasta)
{
    $db = new MysqliDb();
    $resultsDetalles = [];

    $SQL = "select movimiento_id, asiento_id, fecha, c.cuenta_id, c.descripcion, usuario_id, importe, 0 general, 0 control, 0 ca, 0 cc, 0 me,
0 detalles
from movimientos m inner join cuentas c on m.cuenta_id = c.cuenta_id where (m.cuenta_id like '1.1.1.2%' or m.cuenta_id = '1.1.1.10')
and (fecha between '" . $fecha_desde . "' and '" . $fecha_hasta . "');";


//or m.cuenta_id = '1.1.7.01'
//or m.cuenta_id = '1.2.1.01'
//or m.cuenta_id = '1.3.1.01'
//or m.cuenta_id = '1.3.2.01'
//or m.cuenta_id = '1.3.3.01'
//or m.cuenta_id = '2.1.1.01'
//or m.cuenta_id = '2.1.2.01'
//or m.cuenta_id like '4.2.1.%'
//or m.cuenta_id like '5.2.1.%'
//or m.cuenta_id = '5.2.2.01'
//or m.cuenta_id = '5.2.3.01'
//or m.cuenta_id like '5.2.4.%'
//or m.cuenta_id like '5.2.5.%'
//or m.cuenta_id like '5.2.8.%'
//or m.cuenta_id = '5.3.1.01'

    $results = $db->rawQuery($SQL);

    foreach ($results as $row) {
        $SQL = "select
detalle_tipo_id,
valor detalle

 from detallesmovimientos
 where detalle_tipo_id in (2) and movimiento_id =  " . $row['movimiento_id'] . ";";
        $detalles = $db->rawQuery($SQL);

        $row["detalles"] = $detalles;
        array_push($resultsDetalles, $row);

    }

    echo json_encode($resultsDetalles);
}

// Movimientos que modifican el estado de cuentas
function totalConcepto($where, $fecha_desde, $fecha_hasta)
{
    $db = new MysqliDb();
    $resultsDetalles = [];

    $SQL = "select movimiento_id, asiento_id, fecha, c.cuenta_id, c.descripcion, usuario_id, importe, 0 general, 0 control, 0 ca, 0 cc, 0 me,
0 detalles
from movimientos m inner join cuentas c on m.cuenta_id = c.cuenta_id
where " . $where . " and (fecha between '" . $fecha_desde . "' and '" . $fecha_hasta . "');";

    $results = $db->rawQuery($SQL);

    foreach ($results as $row) {
        $SQL = "select
detalle_tipo_id,
valor detalle

 from detallesmovimientos
 where detalle_tipo_id in (2) and movimiento_id =  " . $row['movimiento_id'] . ";";
        $detalles = $db->rawQuery($SQL);

        $row["detalles"] = $detalles;
        array_push($resultsDetalles, $row);

    }

    echo json_encode($resultsDetalles);
}

function getCajaDiaria($sucursal_id)
{
    $db = new MysqliDb();
    $lastCaja = getLastCaja($sucursal_id);
    $resultsDetalles = [];

    $results = $db->rawQuery("select movimiento_id, asiento_id, fecha, cuenta_id, usuario_id, importe, 0 detalles
from movimientos m where m.sucursal_id = " . $sucursal_id . " and (m.cuenta_id like '1.1.1.%' or m.cuenta_id = '1.1.2.01'
or m.cuenta_id like '4.1.1.%')
and asiento_id >= " . $lastCaja['asiento_inicio_id'] . ";");

    foreach ($results as $row) {
        $SQL = "select
detalle_tipo_id,
case when (detalle_tipo_id = 8) then (select nombre from productos where producto_id = valor)
when (detalle_tipo_id = 3) then (select concat(nombre, ' ', apellido) from clientes where cliente_id = valor)
else valor
end detalle

 from detallesmovimientos
 where detalle_tipo_id in (3,8,9,10,13) and movimiento_id =  " . $row['movimiento_id'] . ";";
        $detalles = $db->rawQuery($SQL);

        $row["detalles"] = $detalles;
        array_push($resultsDetalles, $row);

    }

    echo json_encode($resultsDetalles);
}

function getCajaDiariaFromTo($sucursal_id, $asiento_id_inicio, $asiento_id_fin)
{
    $db = new MysqliDb();
    $lastCaja = getLastCaja($sucursal_id);
    $resultsDetalles = [];

    $results = $db->rawQuery("select movimiento_id, asiento_id, fecha, cuenta_id, usuario_id, importe, 0 detalles
from movimientos m where m.sucursal_id = " . $sucursal_id . " and (m.cuenta_id like '1.1.1.%' or m.cuenta_id = '1.1.2.01'
or m.cuenta_id like '4.1.1.%')
and asiento_id >= " . $asiento_id_inicio . " and asiento_id < " . $asiento_id_fin . ";");

    foreach ($results as $row) {
        $SQL = "select
detalle_tipo_id,
case when (detalle_tipo_id = 8) then (select nombre from productos where producto_id = valor)
when (detalle_tipo_id = 3) then (select concat(nombre, ' ', apellido) from clientes where cliente_id = valor)
else valor
end detalle

 from detallesmovimientos
 where detalle_tipo_id in (3,8,9,10,13) and movimiento_id =  " . $row['movimiento_id'] . ";";
        $detalles = $db->rawQuery($SQL);

        $row["detalles"] = $detalles;
        array_push($resultsDetalles, $row);

    }

    echo json_encode($resultsDetalles);
}

function getSaldoFinal($sucursal_id)
{
    $db = new MysqliDb();
    $lastCaja = getLastCaja($sucursal_id);

    $SQL = "
        Select
    ifnull(sum(m.importe),0) total
from
    movimientos m
where
    m.cuenta_id = '1.1.1.0" . $sucursal_id . "'
        and m.asiento_id >= " . $lastCaja['asiento_inicio_id'] . ";";
    $results = $db->rawQuery($SQL);

    echo json_encode($results);


}

function cerrarCaja($importe, $sucursal_id)
{
    $db = new MysqliDb();
//    $decoded = json_decode($params);
    $lastCaja = getLastCaja($sucursal_id);
//
//    if (intval($lastCaja["usuario_id"]) !== $decoded[0]->idUsuario) {
//        echo 'usuario';
//        return;
//    }

    if ($lastCaja["asiento_cierre_id"] !== null && $lastCaja["asiento_cierre_id"] !== 0) {
        echo 'cerrada';
        return;
    }

    $db->rawQuery("update cajas set asiento_cierre_id = (Select max(asiento_id) from movimientos) where
sucursal_id = " . $sucursal_id . " and
caja_id =" . $lastCaja["caja_id"] . ";");


//    for ($i = 0; $i <= 3; $i++) {
        $data = Array(
            "moneda_id" => 1,
            "valor_real" => $importe,
            "valor_esperado" => $importe,
            "caja_id" => $lastCaja["caja_id"]);
        $db->insert("cajas_detalles", $data);

//    }

    echo "ok";
}

//Obtiene el saldo inicial de caja
function getSaldoInicial($sucursal_id)
{
    $db = new MysqliDb();

    $lastCaja = getLastCaja($sucursal_id);
    echo json_encode($lastCaja["saldo_inicial"]);



}

function getSaldoFinalAnterior($sucursal_id)
{
    $db = new MysqliDb();

//    $lastCaja = getLastCaja($sucursal_id);
//    echo json_encode($lastCaja["saldo_inicial"]);


    $results = $db->rawQuery("select valor_real from cajas_detalles where caja_id = (select max(caja_id) from cajas where sucursal_id = ".$sucursal_id.");");

    echo json_encode($results);

}

function checkEstado($sucursal_id)
{
    echo json_encode(getLastCaja($sucursal_id));
}

function getLastCaja($sucursal_id)
{
    $db = new MysqliDb();
    $results = $db->rawQuery("select * from cajas where caja_id = (select max(caja_id) from cajas) and sucursal_id=" . $sucursal_id . ";");

    return $results[0];
}

//Realiza la apertura de la caja
function abrirCaja($importe, $sucursal_id)
{
    $db = new MysqliDb();

//    $decoded = json_decode($params);
    $lastCaja = getLastCaja($sucursal_id);


    if ($lastCaja['asiento_cierre_id'] === null ||$lastCaja['asiento_cierre_id'] === 0 ) {
        echo 'abierta';
//        echo 'La caja se encuentra abierta';
        return;
    }

    $data = Array(
        'usuario_id' => 1,
        'asiento_inicio_id' => $lastCaja['asiento_cierre_id'] + 1,
        'saldo_inicial' => $importe,
        'sucursal_id' => $sucursal_id
    );

    $id = $db->insert('cajas', $data);

    if ($id) {
        echo $id;
    } else {
        echo json_encode($db->getLastError());
    }

}

function getCajasBySucursalId($sucursal_id)
{
    $db = new MysqliDb();
    $db->where('$sucursal_id', $sucursal_id);
    $results = $db->get('cajas');

    echo json_encode($results);

}

function getCajas()
{
    $db = new MysqliDb();
    $results = $db->get('cajas');

    echo json_encode($results);

}