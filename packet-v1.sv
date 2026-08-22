module packet_v1 #(
  DATA_WDITH [7:0] #message_type
)(
  sequence_number [31:0],
  symbol_id [15:0],
  bid_price [31:0],
  ask_price [31:0],
  bid_size [31:0],
  ask_size [31:0],
  timestamp [63:0]
);

