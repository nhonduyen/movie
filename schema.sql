CREATE TABLE `movie` (
 `ID` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
 `NAME` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
 `YEAR` int(4) NOT NULL,
 `POSTER` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
 `TYPE` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
 PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci