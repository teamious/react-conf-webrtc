NO_COLOR=\033[0m
OK_COLOR=\033[32;01m
ERROR_COLOR=\033[31;01m
WARN_COLOR=\033[33;01m

OK_STRING=$(OK_COLOR)[OK]$(NO_COLOR)
ERROR_STRING=$(ERROR_COLOR)[ERRORS]$(NO_COLOR)
WARN_STRING=$(WARN_COLOR)[WARNINGS]$(NO_COLOR)

AWK_CMD = awk '{ printf "%-30s %-10s\n",$$1, $$2; }'
PRINT_ERROR = printf "$@ $(ERROR_STRING)\n" | $(AWK_CMD) && printf "$(CMD)\n$$LOG\n" && false
PRINT_WARNING = printf "$@ $(WARN_STRING)\n" | $(AWK_CMD) && printf "$(CMD)\n$$LOG\n"
PRINT_OK = printf "$@ $(OK_STRING)\n" | $(AWK_CMD)
BUILD_CMD=\
	LOG=$$($(CMD) 2>&1);\
	if [ $$? -eq 1 ]; then $(PRINT_ERROR);\
	elif [ "$$LOG" != "" ] ; then $(PRINT_WARNING);\
	else $(PRINT_OK); fi;

all: build ut

build:
	@@echo "$(OK_COLOR)"'building>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>' && echo "$(NO_COLOR)"
	@npm run build
	@cd demo && npm run build:prod
	@cd demo && docker build -t react-conf-webrtc-docs .
	@$(BUILD_CMD)

test:
	@@echo "$(OK_COLOR)"'building>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>' && echo "$(NO_COLOR)"
	@npm run build

ut:
	@@echo "$(OK_COLOR)"'running unit tests>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>' && echo "$(NO_COLOR)"
	@npm run test
	@$(BUILD_CMD)

serve:
	@@echo "$(OK_COLOR)"'starting services>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>' && echo "$(NO_COLOR)"
	@docker-compose -f docs/docker-compose.yml up -d --remove-orphans


.PHONY: build ut
