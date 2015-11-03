<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);
if ($decoded != null) {
    if ($decoded->function == 'save') {
        saveResultados();
    }
} else {

    $function = $_GET["function"];
    if ($function == 'getResultados') {
        getResultados();
    }
}

function getResultados()
{
    $db = new MysqliDb();
    $db->orderBy('anio');
    $db->orderBy('mes');
    $results = $db->get('resultados');

    echo json_encode($results);
}

/**
 * @description genera un cierre de cuentas a principio de mes, siempre que no exista un registro ya creado
 */
function saveResultados()
{
    $db = new MysqliDb();

    $anio = date('Y');
    $mes = date('m');

    $anio_ant = ($mes == 1) ? $anio - 1 : $anio;
    $mes_ant = ($mes == 1) ? 12 : $mes - 1;


    $results = $db->rawQuery('select anio, mes from resultados where resultado_id = (select max(resultado_id) from resultados);');

    if (($anio > $results[0]["anio"]) || ($anio == $results[0]["anio"] && $mes > $results[0]["mes"] + 1)) {

        $SQL = "SELECT
(select IFNULL(sum(importe),0) + IFNULL((select total from resultados where anio= '" . $results[0]["anio"] . "' and mes = '" . $results[0]["mes"] . "' and cuenta_id= '1.1.1.10'),0) from movimientos where (fecha BETWEEN '" . $anio_ant . "-" . $mes_ant . "-01' AND '" . $anio . "-" . $mes . "-01') and cuenta_id = '1.1.1.10') general,
(select IFNULL(sum(importe),0) + IFNULL((select total from resultados where anio= '" . $results[0]["anio"] . "' and mes = '" . $results[0]["mes"] . "' and cuenta_id= '1.1.1.10'),0) from movimientos where (fecha BETWEEN '" . $anio_ant . "-" . $mes_ant . "-01' AND '" . $anio . "-" . $mes . "-01') and cuenta_id = '1.1.1.10') control,
(select IFNULL(sum(importe),0) + IFNULL((select total from resultados where anio= '" . $results[0]["anio"] . "' and mes = '" . $results[0]["mes"] . "' and cuenta_id= '1.1.1.22'),0) from movimientos where (fecha BETWEEN '" . $anio_ant . "-" . $mes_ant . "-01' AND '" . $anio . "-" . $mes . "-01') and cuenta_id = '1.1.1.22') ca,
(select IFNULL(sum(importe),0) + IFNULL((select total from resultados where anio= '" . $results[0]["anio"] . "' and mes = '" . $results[0]["mes"] . "' and cuenta_id= '1.1.1.21'),0) from movimientos where (fecha BETWEEN '" . $anio_ant . "-" . $mes_ant . "-01' AND '" . $anio . "-" . $mes . "-01') and cuenta_id = '1.1.1.21') cc,
(select IFNULL(sum(importe),0) + IFNULL((select total from resultados where anio= '" . $results[0]["anio"] . "' and mes = '" . $results[0]["mes"] . "' and cuenta_id= '1.1.1.10'),0) from movimientos where (fecha BETWEEN '" . $anio_ant . "-" . $mes_ant . "-01' AND '" . $anio . "-" . $mes . "-01') and cuenta_id = '1.1.1.10') me,
(select IFNULL(sum(importe),0) + IFNULL((select total from resultados where anio= '" . $results[0]["anio"] . "' and mes = '" . $results[0]["mes"] . "' and cuenta_id= '1.1.1.24'),0) from movimientos where (fecha BETWEEN '" . $anio_ant . "-" . $mes_ant . "-01' AND '" . $anio . "-" . $mes . "-01') and cuenta_id = '1.1.1.24') mp,
(select IFNULL(sum(importe),0) + IFNULL((select total from resultados where anio= '" . $results[0]["anio"] . "' and mes = '" . $results[0]["mes"] . "' and cuenta_id= '1.1.4.01'),0) from movimientos where (fecha BETWEEN '" . $anio_ant . "-" . $mes_ant . "-01' AND '" . $anio . "-" . $mes . "-01') and cuenta_id = '1.1.4.01') ta
FROM dual;";

        $results = $db->rawQuery($SQL);

        // general
        $db->insert('resultados', array('anio' => $anio_ant, 'mes' => $mes_ant, 'cuenta_id' =>'1.1.1.10', 'total' => $results[0]['general']));
        // control
        $db->insert('resultados', array('anio' => $anio_ant, 'mes' => $mes_ant, 'cuenta_id' =>'1.1.1.10', 'total' => $results[0]['control']));
        // ca
        $db->insert('resultados', array('anio' => $anio_ant, 'mes' => $mes_ant, 'cuenta_id' =>'1.1.1.22', 'total' => $results[0]['ca']));
        // cc
        $db->insert('resultados', array('anio' => $anio_ant, 'mes' => $mes_ant, 'cuenta_id' =>'1.1.1.21', 'total' => $results[0]['cc']));
        // me
        $db->insert('resultados', array('anio' => $anio_ant, 'mes' => $mes_ant, 'cuenta_id' =>'1.1.1.10', 'total' => $results[0]['me']));
        // mp
        $db->insert('resultados', array('anio' => $anio_ant, 'mes' => $mes_ant, 'cuenta_id' =>'1.1.1.24', 'total' => $results[0]['mp']));
        // ta
        $db->insert('resultados', array('anio' => $anio_ant, 'mes' => $mes_ant, 'cuenta_id' =>'1.1.4.01', 'total' => $results[0]['ta']));

    }


}