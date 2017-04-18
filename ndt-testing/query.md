SELECT 
  
  8 * (web100_log_entry.snap.HCThruOctetsReceived/web100_log_entry.snap.Duration) AS upload_Mbps
 
  /*8 * (web100_log_entry.snap.HCThruOctetsAcked /
      (web100_log_entry.snap.SndLimTimeRwin +
       web100_log_entry.snap.SndLimTimeCwnd +
       web100_log_entry.snap.SndLimTimeSnd)) AS download_Mbps*/
       
FROM 
  plx.google:m_lab.ndt.all 
  
WHERE 
  //Limit to Berlin
  connection_spec.client_geolocation.city = "Berlin" 
  AND connection_spec.client_geolocation.country_code = "DE"
  
  //Limit to last year
  AND log_time > TIMESTAMP_TO_SEC(TIMESTAMP("2016-01-01 00:00:00"))
  
  //Upload where
  AND IS_EXPLICITLY_DEFINED(web100_log_entry.connection_spec.local_ip)
  AND IS_EXPLICITLY_DEFINED(web100_log_entry.snap.HCThruOctetsReceived)
  AND IS_EXPLICITLY_DEFINED(web100_log_entry.snap.Duration)
  AND project = 0
  AND IS_EXPLICITLY_DEFINED(connection_spec.data_direction)
  AND connection_spec.data_direction = 0
  AND IS_EXPLICITLY_DEFINED(web100_log_entry.is_last_entry)
  AND web100_log_entry.is_last_entry = True
  AND web100_log_entry.snap.HCThruOctetsReceived >= 8192
  AND web100_log_entry.snap.Duration >= 9000000
  AND web100_log_entry.snap.Duration < 3600000000
  AND (web100_log_entry.snap.State == 1
      OR (web100_log_entry.snap.State >= 5
          AND web100_log_entry.snap.State <= 11))
  
 //Download where
 /*AND IS_EXPLICITLY_DEFINED(web100_log_entry.connection_spec.remote_ip)
 AND IS_EXPLICITLY_DEFINED(web100_log_entry.connection_spec.local_ip)
 AND IS_EXPLICITLY_DEFINED(web100_log_entry.snap.HCThruOctetsAcked)
 AND IS_EXPLICITLY_DEFINED(web100_log_entry.snap.SndLimTimeRwin)
 AND IS_EXPLICITLY_DEFINED(web100_log_entry.snap.SndLimTimeCwnd)
 AND IS_EXPLICITLY_DEFINED(web100_log_entry.snap.SndLimTimeSnd)
 AND project = 0
 AND IS_EXPLICITLY_DEFINED(connection_spec.data_direction)
 AND connection_spec.data_direction = 1
 AND IS_EXPLICITLY_DEFINED(web100_log_entry.is_last_entry)
 AND web100_log_entry.is_last_entry = True
 AND web100_log_entry.snap.HCThruOctetsAcked >= 8192
 AND (web100_log_entry.snap.SndLimTimeRwin +
      web100_log_entry.snap.SndLimTimeCwnd +
      web100_log_entry.snap.SndLimTimeSnd) >= 9000000
 AND (web100_log_entry.snap.SndLimTimeRwin +
      web100_log_entry.snap.SndLimTimeCwnd +  
      web100_log_entry.snap.SndLimTimeSnd) < 3600000000
 AND IS_EXPLICITLY_DEFINED(web100_log_entry.snap.CongSignals)
 AND web100_log_entry.snap.CongSignals > 0
 AND (web100_log_entry.snap.State == 1
      OR (web100_log_entry.snap.State >= 5
          AND web100_log_entry.snap.State <= 11))*/

LIMIT 21000 OFFSET 11000