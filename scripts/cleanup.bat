set service_name="aztest"
set access_token="SharedAccessSignature 58d58f2efbe665006b030003&201903102336&rVsUnEwV1KhlKD8yz4MnpnYopZi1IYi3LbbhuBzQ1BWSiECG+j2CH8O8RA7/JF0FTbl+QroozdGuPjm3mWAGLA=="

node ./cleanup %service_name% %access_token%