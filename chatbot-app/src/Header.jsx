const Header = () =>{
    return (
        <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              justifyContent: "space-between",
            }}
          >
            {/* Model Selector */}
            <FormControl size="small">
              <Box sx={{ display: "flex", gap: "1rem" }}>
                {selectedModel["has_api_key"] && (
                  <TextField
                    sx={{ minWidth: "30%" }}
                    label="Type your api-key here"
                    variant="outlined"
                    value={apiKey}
                    onChange={handleApiKeyChange}
                  />
                )}
                <Select
                  value={selectedModelId}
                  onChange={handleModelChange}
                  displayEmpty
                  sx={{
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    },
                  }}
                >
                  {models.map((model) => (
                    <MenuItem
                      key={model.id}
                      value={model.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <FaRobot />
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2">{model.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {model.source}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </FormControl>
          </Box>
    )
}