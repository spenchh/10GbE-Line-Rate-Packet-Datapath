message = 1
sequence_number = 42
symbol_id = 7
bid_price = 1743100
ask_price = 1743300
bid_size = 800
ask_size = 500
timestamp = 123456789

bits_eight = 8
bits_sixteen = 16
bits_thirty_two = 32
bits_sixty_four = 64

binary_message = f"{message:0{bits_eight}b}"
binary_sequence_number = f"{sequence_number:0{bits_thirty_two}b}"
binary_symbol_id = f"{symbol_id:0{bits_sixteen}b}"
binary_bid_price = f"{bid_price:0{bits_thirty_two}b}"
binary_ask_price = f"{ask_price:0{bits_thirty_two}b}"
binary_bid_size = f"{bid_size:0{bits_thirty_two}b}"
binary_ask_size = f"{ask_size:0{bits_thirty_two}b}"
binary_timestamp = f"{timestamp:0{bits_sixty_four}b}"

packet_bits = (
  binary_message 
  + binary_sequence_number
  + binary_symbol_id
  + binary_bid_price
  + binary_ask_price
  + binary_bid_size
  + binary_ask_size
  + binary_timestamp
)
