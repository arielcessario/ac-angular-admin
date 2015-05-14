<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);
if ($decoded != null) {
    if ($decoded->function == 'getCajaDiaria') {
        getCajaDiaria($decoded->sucursal_id);
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
    $moneda = 2;
    $totales = Array();


    for ($i = 2; $i < 5; $i++) {
        $moneda = $i;
        $SQL = "Select " . $moneda . " idMoneda,
    ifnull(sum(m.importe),0) total
from
    movimientos m
where
    m.idCuenta = '1.1.1.01'
        and m.idMovimiento in (select distinct
            (idMovimiento)
        from
            detallesmovimientos d
        where
            d.idMovimiento in (select
                    idMovimiento
                from
                    movimientos
                where
                    idAsiento >= " . $lastCaja['idAsientoInicio'] . ")
                and d.idMovimiento in (select
                    dd.idMovimiento
                from
                    detallesmovimientos dd
                where
					valor = " . $moneda . " and
                    idTipoDetalle = 5
                        and dd.idMovimiento in (select
                            idMovimiento
                        from
                            movimientos
                        where
                            idAsiento >= " . $lastCaja['idAsientoInicio'] . " )));";
        $results = $db->rawQuery($SQL);
        array_push($totales, $results);
    }

    echo json_encode($totales);


}

function cerrarCaja($params)
{
//    $db = new MysqliDb();
//    $decoded = json_decode($params);
//    $lastCaja = getLastCaja();
//
//    if (intval($lastCaja["idUsuario"]) !== $decoded[0]->idUsuario) {
//        echo 'usuario';
//        return;
//    }
//
//    if ($lastCaja["idAsientoCierre"] !== null) {
//        echo 'cerrada';
//        return;
//    }
//
//    $db->rawQuery("update cajas set idAsientoCierre = (Select max(idAsiento) from movimientos) where idCaja =" . $lastCaja["idCaja"] . ";");
//
//
//    for ($i = 0; $i <= 3; $i++) {
//        $data = Array(
//            "idMoneda" => $decoded[$i]->idMoneda,
//            "valorReal" => $decoded[$i]->valor,
//            "valorEsperado" => $decoded[$i]->valor,
//            "idCaja" => $lastCaja["idCaja"]);
//        $db->insert("detallescajas", $data);
//
//    }
//
//    echo "ok";
}

//Obtiene el saldo inicial de caja
function getSaldoInicial($sucursal_id)
{
    $db = new MysqliDb();

    $lastCaja = getLastCaja($sucursal_id);
    echo json_encode($lastCaja["saldo_inicial"]);


//    $SQL = 'Select
//    sum(m.importe) total
//from
//    movimientos m
//where
//    m.cuenta_id like "1.1.1.%"
//        and m.movimiento_id in (select distinct
//            (movimiento_id)
//        from
//            detallesmovimientos d
//        where
//            d.movimiento_id in (select
//                    movimiento_id
//                from
//                    movimientos
//                where
//                    asiento_id between ' . $lastCaja['asiento_inicio_id'] . ' and ' . $lastCaja['asiento_cierre_id'] . ')
//                and d.movimiento_id not in (select
//                    dd.movimiento_id
//                from
//                    detallesmovimientos dd
//                where
//                    detalle_tipo_id = 5
//                        and dd.movimiento_id in (select
//                            movimiento_id
//                        from
//                            movimientos
//                        where
//                            asiento_id between ' . $lastCaja['asiento_inicio_id'] . ' and ' . $lastCaja['asiento_cierre_id'] . ')));';

//    $results = $db->rawQuery($SQL);

//    echo json_encode($results[0]['total'] + $lastCaja['saldo_inicial']);


}

function checkEstado()
{
//    echo json_encode(getLastCaja());
}

function getLastCaja($sucursal_id)
{
    $db = new MysqliDb();
    $results = $db->rawQuery("select * from cajas where caja_id = (select max(caja_id) from cajas) and sucursal_id=" . $sucursal_id . ";");

    return $results[0];
}

//Realiza la apertura de la caja
function abrirCaja($params, $sucursal_id)
{
    $db = new MysqliDb();

    $decoded = json_decode($params);
    $lastCaja = getLastCaja($sucursal_id);


    if ($lastCaja['idAsientoCierre'] === null) {
        echo 'abierta';
//        echo 'La caja se encuentra abierta';
        return;
    }

    $data = Array(
        'idUsuario' => $decoded->idUsuario,
        'idAsientoInicio' => $lastCaja['idAsientoCierre'] + 1,
        'saldoInicial' => $decoded->saldoInicial
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